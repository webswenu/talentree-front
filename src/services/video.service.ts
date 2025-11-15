import { apiService } from "./api.service";
import {
    UploadVideoDto,
    VideoStatusResponse,
    WorkerVideoRequirement,
} from "../types/video.types";

class VideoService {
    private basePath = "/video-requirements";

    async uploadVideo(data: UploadVideoDto): Promise<WorkerVideoRequirement> {
        const response = await apiService.post<WorkerVideoRequirement>(
            `${this.basePath}/upload`,
            data
        );
        return response.data;
    }

    async uploadVideoFile(
        videoBlob: Blob,
        workerId: string,
        processId: string,
        workerProcessId: string | undefined,
        videoDuration: number
    ): Promise<WorkerVideoRequirement> {
        const formData = new FormData();
        formData.append("video", videoBlob, `video-${Date.now()}.webm`);
        formData.append("workerId", workerId);
        formData.append("processId", processId);
        if (workerProcessId) {
            formData.append("workerProcessId", workerProcessId);
        }
        formData.append("videoDuration", videoDuration.toString());

        const response = await apiService.post<WorkerVideoRequirement>(
            `${this.basePath}/upload-file`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data;
    }

    async getWorkerVideoStatus(
        workerId: string,
        processId: string,
        workerProcessId?: string
    ): Promise<VideoStatusResponse> {
        const params = workerProcessId ? { workerProcessId } : {};
        const response = await apiService.get<VideoStatusResponse>(
            `${this.basePath}/worker/${workerId}/process/${processId}/status`,
            { params }
        );
        return response.data;
    }

    async canAccessTests(
        workerId: string,
        processId: string,
        workerProcessId?: string
    ): Promise<{ canAccess: boolean }> {
        const params = workerProcessId ? { workerProcessId } : {};
        const response = await apiService.get<{ canAccess: boolean }>(
            `${this.basePath}/worker/${workerId}/process/${processId}/can-access-tests`,
            { params }
        );
        return response.data;
    }

    async getWorkerVideoForProcess(
        workerId: string,
        processId: string
    ): Promise<WorkerVideoRequirement | null> {
        try {
            const response = await apiService.get<WorkerVideoRequirement>(
                `${this.basePath}/worker/${workerId}/process/${processId}`
            );
            return response.data;
        } catch (error: unknown) {
            if (
                error &&
                typeof error === 'object' &&
                'response' in error &&
                error.response &&
                typeof error.response === 'object' &&
                'status' in error.response &&
                error.response.status === 404
            ) {
                return null;
            }
            throw error;
        }
    }

    getVideoDownloadUrl(videoId: string): string {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
        return `${API_URL}${this.basePath}/${videoId}/download`;
    }

    async downloadVideo(videoId: string, filename: string = "video.webm"): Promise<void> {
        const response = await apiService.get<Blob>(`${this.basePath}/${videoId}/download`, {
            responseType: "blob",
        });

        // Create blob link to download
        const blob = response.data instanceof Blob ? response.data : new Blob([response.data as BlobPart]);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
}

export const videoService = new VideoService();
export default videoService;
