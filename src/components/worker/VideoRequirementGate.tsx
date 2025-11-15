import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { processesService } from "../../services/processes.service";
import { videoService } from "../../services/video.service";
import { VideoRecorder } from "./VideoRecorder";

interface VideoRequirementGateProps {
    processId: string;
    workerId: string;
    workerProcessId?: string;
    onVideoCompleted: () => void;
    children: React.ReactNode;
}

type UploadState = "idle" | "uploading" | "success" | "error";

export const VideoRequirementGate = ({
    processId,
    workerId,
    workerProcessId,
    onVideoCompleted,
    children,
}: VideoRequirementGateProps) => {
    const queryClient = useQueryClient();
    const [showRecorder, setShowRecorder] = useState(false);
    const [uploadState, setUploadState] = useState<UploadState>("idle");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");

    // Fetch video requirement config for this process
    const { data: videoConfig, isLoading: configLoading } = useQuery({
        queryKey: ["process-video-requirement", processId],
        queryFn: () => processesService.getVideoRequirement(processId),
    });

    // Fetch worker's video status for this specific workerProcess
    const { data: videoStatus, isLoading: statusLoading } = useQuery({
        queryKey: ["worker-video-status", workerId, processId, workerProcessId],
        queryFn: () => videoService.getWorkerVideoStatus(workerId, processId, workerProcessId),
        enabled: !!videoConfig?.isRequired,
    });

    // Upload mutation
    const uploadMutation = useMutation({
        mutationFn: async ({ videoBlob, duration }: { videoBlob: Blob; duration: number }) => {
            // Upload video file to backend
            // Backend will convert WebM to MP4 (H.264/AAC) using FFmpeg for maximum compatibility
            return videoService.uploadVideoFile(
                videoBlob,
                workerId,
                processId,
                workerProcessId,
                duration
            );
        },
        onSuccess: () => {
            setUploadState("success");

            // Show success message for 2 seconds
            setTimeout(() => {
                // Invalidate query to refresh video status
                queryClient.invalidateQueries({
                    queryKey: ["worker-video-status", workerId, processId, workerProcessId],
                });

                // Reload page to show tests
                setTimeout(() => {
                    onVideoCompleted();
                }, 500);
            }, 2000);
        },
        onError: (error: unknown) => {
            setUploadState("error");
            let errorMsg = "Error al subir el video";
            
            if (error && typeof error === "object" && "response" in error) {
                const axiosError = error as {
                    response?: {
                        data?: {
                            message?: string | string[];
                        };
                    };
                };
                
                const message = axiosError.response?.data?.message;
                
                if (typeof message === "string") {
                    errorMsg = message;
                } else if (Array.isArray(message) && message.length > 0) {
                    errorMsg = message[0];
                }
            } else if (error instanceof Error) {
                errorMsg = error.message;
            }
            
            setErrorMessage(errorMsg);
        },
    });

    const handleVideoRecorded = async (blob: Blob, duration: number) => {
        setUploadState("uploading");
        setShowRecorder(false);

        // Simulate upload progress
        const progressInterval = setInterval(() => {
            setUploadProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return 90;
                }
                return prev + 10;
            });
        }, 500);

        try {
            await uploadMutation.mutateAsync({ videoBlob: blob, duration });
            setUploadProgress(100);
        } catch {
            // Error is handled by mutation's onError callback
        } finally {
            clearInterval(progressInterval);
        }
    };

    const handleCancelRecording = () => {
        setShowRecorder(false);
    };

    // Loading state
    if (configLoading || statusLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verificando requisitos...</p>
                </div>
            </div>
        );
    }

    // No video required or already has video - show children (tests)
    // BUT: Don't skip to tests if we're currently uploading or showing success
    if ((!videoConfig?.isRequired || videoStatus?.hasVideo) && uploadState !== "uploading" && uploadState !== "success") {
        return <>{children}</>;
    }

    // Show recorder
    if (showRecorder && videoConfig) {
        return (
            <VideoRecorder
                maxDuration={videoConfig.maxDuration || 180}
                questions={videoConfig.questions}
                instructions={videoConfig.instructions}
                workerId={workerId}
                onVideoRecorded={handleVideoRecorded}
                onCancel={handleCancelRecording}
            />
        );
    }

    // Show upload progress
    if (uploadState === "uploading") {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Subiendo video...
                        </h2>
                        <p className="text-gray-600">
                            Estamos procesando tu video. Esto puede tomar unos segundos.
                        </p>
                    </div>

                    <div className="mb-6">
                        <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-6 rounded-full transition-all duration-500 ease-out flex items-center justify-end px-2"
                                style={{ width: `${uploadProgress}%` }}
                            >
                                {uploadProgress > 10 && (
                                    <span className="text-white text-xs font-semibold">
                                        {uploadProgress}%
                                    </span>
                                )}
                            </div>
                        </div>
                        {uploadProgress < 100 && (
                            <p className="text-center text-gray-600 mt-3 font-medium">
                                {uploadProgress}% completado
                            </p>
                        )}
                        {uploadProgress === 100 && (
                            <p className="text-center text-green-600 mt-3 font-medium">
                                ✓ Upload completado, finalizando...
                            </p>
                        )}
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800 text-center flex items-center justify-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Por favor no cierres esta ventana ni recargues la página
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Show success
    if (uploadState === "success") {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-8 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-green-900 mb-3">
                        ¡Video subido exitosamente!
                    </h2>
                    <p className="text-green-700 text-lg mb-4">
                        Tu video ha sido procesado correctamente.
                    </p>
                    <div className="flex items-center justify-center text-green-600">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600 mr-2"></div>
                        <span className="font-medium">Cargando tests psicotécnicos...</span>
                    </div>
                </div>
            </div>
        );
    }

    // Show error
    if (uploadState === "error") {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-8">
                    <div className="text-6xl mb-4 text-center">❌</div>
                    <h2 className="text-2xl font-bold text-red-900 mb-2 text-center">
                        Error al subir el video
                    </h2>
                    <p className="text-red-700 mb-4 text-center">{errorMessage}</p>
                    <div className="flex justify-center space-x-3">
                        <button
                            onClick={() => {
                                setUploadState("idle");
                                setShowRecorder(true);
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                            Intentar nuevamente
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Show video requirement notice
    if (!videoConfig) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
                    <p className="text-yellow-800">No se pudo cargar la configuración del video.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-6">
                    <div className="text-6xl mb-4">🎥</div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Video Introductorio Requerido
                    </h2>
                    <p className="text-gray-600">
                        Este proceso requiere que grabes un video introductorio antes de
                        acceder a los tests psicotécnicos.
                    </p>
                </div>

                {videoConfig.instructions && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                        <h3 className="font-semibold text-blue-900 mb-2">
                            ¿Qué debes incluir en tu video?
                        </h3>
                        <p className="text-blue-800 whitespace-pre-wrap">
                            {videoConfig.instructions}
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                        <span className="text-2xl">⏱️</span>
                        <div>
                            <h4 className="font-semibold text-gray-900">Duración</h4>
                            <p className="text-sm text-gray-600">
                                Máximo{" "}
                                {Math.floor((videoConfig.maxDuration || 180) / 60)}{" "}
                                minutos y {(videoConfig.maxDuration || 180) % 60}{" "}
                                segundos
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                        <span className="text-2xl">❓</span>
                        <div>
                            <h4 className="font-semibold text-gray-900">Preguntas</h4>
                            <p className="text-sm text-gray-600">
                                {videoConfig.questions?.length || 0} pregunta(s)
                                aparecerán durante la grabación
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                        <span className="text-2xl">📹</span>
                        <div>
                            <h4 className="font-semibold text-gray-900">Requisitos</h4>
                            <p className="text-sm text-gray-600">
                                Cámara y micrófono habilitados
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                        <span className="text-2xl">✅</span>
                        <div>
                            <h4 className="font-semibold text-gray-900">
                                Acceso automático
                            </h4>
                            <p className="text-sm text-gray-600">
                                Tests se habilitan inmediatamente tras subir
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={() => setShowRecorder(true)}
                        className="px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        🎥 Comenzar Grabación
                    </button>
                </div>
            </div>
        </div>
    );
};
