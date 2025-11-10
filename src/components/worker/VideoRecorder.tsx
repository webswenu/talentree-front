import { useState, useRef, useEffect } from "react";
import { VideoQuestion } from "../../types/process.types";

interface VideoRecorderProps {
    maxDuration: number; // seconds
    questions?: VideoQuestion[];
    instructions?: string;
    workerId?: string;
    onVideoRecorded: (blob: Blob, duration: number) => void;
    onCancel: () => void;
}

type RecordingState = "idle" | "countdown" | "recording" | "stopped" | "review" | "error";

export const VideoRecorder = ({
    maxDuration,
    questions = [],
    instructions,
    workerId,
    onVideoRecorded,
    onCancel,
}: VideoRecorderProps) => {
    const [state, setState] = useState<RecordingState>("idle");
    const [countdown, setCountdown] = useState(3);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState<VideoQuestion | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [hasPermission, setHasPermission] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [recordedDuration, setRecordedDuration] = useState(0);
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>("");

    const videoRef = useRef<HTMLVideoElement>(null);
    const previewVideoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);
    const questionTimerRef = useRef<number | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const hasCalledOnVideoRecorded = useRef(false);

    const [audioLevel, setAudioLevel] = useState(0);

    // Request camera permission on mount
    useEffect(() => {
        requestPermission();
        return () => {
            cleanup();
        };
    }, []);

    // Cleanup blob URL on unmount
    useEffect(() => {
        return () => {
            if (videoPreviewUrl) {
                URL.revokeObjectURL(videoPreviewUrl);
            }
        };
    }, [videoPreviewUrl]);

    // Assign stream to video element when both are ready
    useEffect(() => {
        if (streamRef.current && videoRef.current && !videoRef.current.srcObject) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.play().catch((playError) => {
                console.error("Error al reproducir video:", playError);
            });
        }
    }, [streamRef.current, videoRef.current]);

    // Timer for recording
    useEffect(() => {
        if (state === "recording") {
            timerRef.current = setInterval(() => {
                setElapsedTime((prev) => {
                    const newTime = prev + 1;

                    // Check for questions to display
                    const questionToShow = questions.find(
                        (q) => q.displayAtSecond === newTime
                    );
                    if (questionToShow) {
                        setCurrentQuestion(questionToShow);
                        // Hide question after 5 seconds
                        if (questionTimerRef.current) {
                            clearTimeout(questionTimerRef.current);
                        }
                        questionTimerRef.current = setTimeout(() => {
                            setCurrentQuestion(null);
                        }, 5000);
                    }

                    // Stop recording when max duration is reached
                    if (newTime >= maxDuration) {
                        stopRecording();
                    }

                    return newTime;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [state, maxDuration, questions]);

    const setupAudioAnalyser = (stream: MediaStream) => {
        try {
            const audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(stream);

            analyser.fftSize = 256;
            microphone.connect(analyser);

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;

            // Start monitoring audio level
            monitorAudioLevel();
        } catch (error) {
            console.error("Error setting up audio analyser:", error);
        }
    };

    const monitorAudioLevel = () => {
        if (!analyserRef.current) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const checkLevel = () => {
            if (!analyserRef.current) return;

            analyserRef.current.getByteFrequencyData(dataArray);

            // Calculate average volume
            const average = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
            // Normalize to 0-100
            const normalizedLevel = Math.min(100, (average / 255) * 200);

            setAudioLevel(normalizedLevel);

            animationFrameRef.current = requestAnimationFrame(checkLevel);
        };

        checkLevel();
    };

    const requestPermission = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280, min: 640 },
                    height: { ideal: 720, min: 480 },
                    facingMode: "user",
                    frameRate: { ideal: 30 },
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100,
                },
            });

            streamRef.current = stream;
            setHasPermission(true);
            setErrorMessage("");

            // Setup audio level monitoring
            setupAudioAnalyser(stream);

            // El useEffect se encargará de asignar el stream cuando el videoRef esté listo
        } catch (error: any) {
            console.error("Error accessing media devices:", error);
            setErrorMessage(
                "No se pudo acceder a la cámara y micrófono. Por favor verifica los permisos."
            );
            setState("error");
            setHasPermission(false);
        }
    };

    const startCountdown = () => {
        setState("countdown");
        setCountdown(3);

        const countdownInterval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(countdownInterval);
                    startRecording();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const startRecording = () => {
        if (!streamRef.current) {
            setErrorMessage("No hay stream disponible");
            setState("error");
            return;
        }

        try {
            // Recording settings with better quality
            const options: MediaRecorderOptions = {
                videoBitsPerSecond: 2500000,  // 2.5 Mbps for good quality
                audioBitsPerSecond: 128000,   // 128 kbps audio
            };

            // Use VP8 with Opus for best quality/compatibility balance
            if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")) {
                options.mimeType = "video/webm;codecs=vp8,opus";
            } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8")) {
                options.mimeType = "video/webm;codecs=vp8";
            } else if (MediaRecorder.isTypeSupported("video/webm")) {
                options.mimeType = "video/webm";
            }

            const mediaRecorder = new MediaRecorder(streamRef.current, options);
            const mimeType = options.mimeType || "video/webm";

            chunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                // Prevent multiple calls
                if (hasCalledOnVideoRecorded.current) {
                    return;
                }

                hasCalledOnVideoRecorded.current = true;

                const blob = new Blob(chunksRef.current, {
                    type: mimeType,
                });

                // Create URL for preview
                const url = URL.createObjectURL(blob);

                // Save blob for review/download
                setRecordedBlob(blob);
                setRecordedDuration(elapsedTime);
                setVideoPreviewUrl(url);
                setState("review");
            };

            // Start recording - use default timeslice (browser decides)
            mediaRecorder.start();
            mediaRecorderRef.current = mediaRecorder;

            setState("recording");
            setElapsedTime(0);
        } catch (error) {
            console.error("Error starting recording:", error);
            setErrorMessage("Error al iniciar la grabación");
            setState("error");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && state === "recording") {
            mediaRecorderRef.current.stop();
            setState("stopped");

            // Clear timer to prevent auto-stop from firing
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    };

    const cleanup = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        if (questionTimerRef.current) {
            clearTimeout(questionTimerRef.current);
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    const handleCancel = () => {
        cleanup();
        onCancel();
    };

    const handleDownload = () => {
        if (!recordedBlob) return;

        // Determine file extension based on mime type
        const extension = recordedBlob.type.includes("mp4") ? "mp4" : "webm";

        const url = URL.createObjectURL(recordedBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `video-${workerId || "test"}-${Date.now()}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleConfirmUpload = () => {
        if (!recordedBlob) return;

        onVideoRecorded(recordedBlob, recordedDuration);
        cleanup();
    };

    const handleRetry = () => {
        if (videoPreviewUrl) {
            URL.revokeObjectURL(videoPreviewUrl);
        }
        setRecordedBlob(null);
        setRecordedDuration(0);
        setVideoPreviewUrl("");
        hasCalledOnVideoRecorded.current = false;
        setState("idle");
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    const remainingTime = maxDuration - elapsedTime;

    if (state === "error") {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-red-900 mb-2">
                        Error de permisos
                    </h3>
                    <p className="text-red-700 mb-4">{errorMessage}</p>
                    <div className="flex space-x-3">
                        <button
                            onClick={requestPermission}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                            Reintentar
                        </button>
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (state === "idle" && !hasPermission) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Solicitando permisos de cámara...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* Instructions */}
            {state === "idle" && instructions && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                        📹 Instrucciones para la grabación
                    </h3>
                    <p className="text-blue-800 whitespace-pre-wrap">{instructions}</p>
                    <div className="mt-4 flex items-start space-x-2 text-sm text-blue-700">
                        <span>⏱️</span>
                        <p>
                            Duración máxima: {Math.floor(maxDuration / 60)} minutos y{" "}
                            {maxDuration % 60} segundos
                        </p>
                    </div>
                    {questions.length > 0 && (
                        <div className="mt-3 flex items-start space-x-2 text-sm text-blue-700">
                            <span>❓</span>
                            <p>
                                Durante la grabación aparecerán {questions.length}{" "}
                                pregunta(s) que debes responder
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Video Preview */}
            <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                />

                {/* Audio Level Indicator (Preview Mode) */}
                {state === "idle" && hasPermission && (
                    <div className="absolute bottom-4 left-4">
                        <div className="flex items-center space-x-3 bg-black bg-opacity-75 text-white px-4 py-3 rounded-lg">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <div className="text-xs text-gray-300 mb-1">Nivel de Audio</div>
                                <div className="flex items-end space-x-1 h-8">
                                    {[0, 1, 2, 3, 4, 5, 6, 7].map((bar) => {
                                        const barHeight = (bar + 1) * 12.5;
                                        const isActive = audioLevel > bar * 12.5;
                                        return (
                                            <div
                                                key={bar}
                                                className={`w-2 rounded-full transition-all duration-100 ${
                                                    isActive
                                                        ? audioLevel > 70
                                                            ? "bg-red-500"
                                                            : audioLevel > 40
                                                            ? "bg-yellow-400"
                                                            : "bg-green-500"
                                                        : "bg-gray-600"
                                                }`}
                                                style={{
                                                    height: `${barHeight}%`,
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Countdown Overlay */}
                {state === "countdown" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="text-white text-9xl font-bold animate-pulse">
                            {countdown}
                        </div>
                    </div>
                )}

                {/* Recording Indicator */}
                {state === "recording" && (
                    <div className="absolute top-4 left-4 flex items-center space-x-4">
                        {/* REC Badge */}
                        <div className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-full">
                            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                            <span className="font-semibold">REC</span>
                        </div>

                        {/* Audio Level Indicator */}
                        <div className="flex items-center space-x-2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-full">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                            </svg>
                            <div className="flex items-end space-x-1 h-6">
                                {[0, 1, 2, 3, 4].map((bar) => {
                                    const barHeight = (bar + 1) * 20;
                                    const isActive = audioLevel > bar * 20;
                                    return (
                                        <div
                                            key={bar}
                                            className={`w-1.5 rounded-full transition-all duration-100 ${
                                                isActive
                                                    ? audioLevel > 70
                                                        ? "bg-red-500"
                                                        : audioLevel > 40
                                                        ? "bg-yellow-400"
                                                        : "bg-green-500"
                                                    : "bg-gray-600"
                                            }`}
                                            style={{
                                                height: `${barHeight}%`,
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Timer */}
                {state === "recording" && (
                    <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg">
                        <div className="text-2xl font-mono font-bold">
                            {formatTime(elapsedTime)}
                        </div>
                        <div className="text-xs text-gray-300 text-center">
                            Restante: {formatTime(remainingTime)}
                        </div>
                    </div>
                )}

                {/* Current Question Overlay */}
                {currentQuestion && state === "recording" && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6">
                        <div className="text-white">
                            <div className="text-sm font-semibold text-yellow-400 mb-2">
                                Pregunta {currentQuestion.order}:
                            </div>
                            <div className="text-xl font-medium">
                                {currentQuestion.question}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="flex justify-center space-x-4">
                {state === "idle" && (
                    <>
                        <button
                            onClick={startCountdown}
                            className="px-8 py-3 bg-red-600 text-white text-lg font-semibold rounded-lg hover:bg-red-700 transition-colors"
                        >
                            🎥 Iniciar Grabación
                        </button>
                        <button
                            onClick={handleCancel}
                            className="px-8 py-3 bg-gray-300 text-gray-700 text-lg font-semibold rounded-lg hover:bg-gray-400 transition-colors"
                        >
                            Cancelar
                        </button>
                    </>
                )}

                {state === "recording" && (
                    <button
                        onClick={stopRecording}
                        className="px-8 py-3 bg-red-600 text-white text-lg font-semibold rounded-lg hover:bg-red-700 transition-colors"
                    >
                        ✅ Terminar Grabación
                    </button>
                )}

                {state === "stopped" && (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-gray-600">Procesando video...</p>
                    </div>
                )}

                {state === "review" && (
                    <div className="w-full max-w-4xl mx-auto">
                        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6">
                            <div className="flex items-center justify-center mb-4">
                                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-green-900 text-center mb-2">
                                ¡Grabación completada!
                            </h3>
                            <p className="text-green-700 text-center mb-1">
                                Duración: {formatTime(recordedDuration)}
                            </p>
                            <p className="text-green-700 text-center text-sm">
                                Tamaño: {((recordedBlob?.size || 0) / (1024 * 1024)).toFixed(2)} MB
                            </p>
                        </div>

                        {/* Instructions */}
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
                            <div className="flex items-start">
                                <svg className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <h4 className="font-semibold text-blue-900 mb-2">
                                        📹 Tu video ha sido grabado exitosamente
                                    </h4>
                                    <p className="text-sm text-blue-800 mb-3">
                                        Durante la grabación pudiste ver tu imagen y escuchar el audio en tiempo real.
                                        El video ha sido capturado correctamente con una duración de <strong>{formatTime(recordedDuration)}</strong>.
                                    </p>
                                    <p className="text-sm text-blue-800">
                                        ¿Estás satisfecho con la grabación? Si es así, puedes subirla ahora.
                                        Si no, puedes grabar de nuevo.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col space-y-3">
                            <button
                                onClick={handleConfirmUpload}
                                className="w-full px-6 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 transition-colors"
                            >
                                ✓ Confirmar y Subir Video
                            </button>

                            <button
                                onClick={handleRetry}
                                className="w-full px-6 py-3 bg-gray-400 text-white text-lg font-semibold rounded-lg hover:bg-gray-500 transition-colors"
                            >
                                🔄 Grabar de Nuevo
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
