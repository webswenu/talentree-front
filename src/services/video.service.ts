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
        processId: string
    ): Promise<VideoStatusResponse> {
        const response = await apiService.get<VideoStatusResponse>(
            `${this.basePath}/worker/${workerId}/process/${processId}/status`
        );
        return response.data;
    }

    async canAccessTests(
        workerId: string,
        processId: string
    ): Promise<{ canAccess: boolean }> {
        const response = await apiService.get<{ canAccess: boolean }>(
            `${this.basePath}/worker/${workerId}/process/${processId}/can-access-tests`
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
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    }
}

export const videoService = new VideoService();
export default videoService;
