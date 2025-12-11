import { apiService } from "./api.service";

export interface SendContactFormDto {
    nombre: string;
    telefono: string;
    correo: string;
    asunto: string;
}

export interface ContactFormResponse {
    message: string;
}

class ContactService {
    private basePath = "/contact";

    /**
     * Envía el formulario de contacto
     * Endpoint público que envía confirmación al remitente y notificación a contacto@talentree.cl
     */
    async sendContactForm(dto: SendContactFormDto): Promise<ContactFormResponse> {
        const response = await apiService.post<ContactFormResponse>(
            `${this.basePath}/send`,
            dto
        );
        return response.data;
    }
}

export const contactService = new ContactService();
