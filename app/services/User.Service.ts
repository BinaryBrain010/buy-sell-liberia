import axios from "./BaseService";

interface ContactInfo {
  phone: string;
  name: string;
}

class UserClient {
  async getUserContact(id: string): Promise<ContactInfo> {
    try {
      console.log("[USER CLIENT] Fetching contact info for user:", id);
      const response = await axios.get<ContactInfo>(`/users/${id}/contact`);
      console.log("[USER CLIENT] Contact info response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error(
        "[USER CLIENT] Get contact info error:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.error || "Failed to get contact information"
      );
    }
  }
}

export const userClient = new UserClient();