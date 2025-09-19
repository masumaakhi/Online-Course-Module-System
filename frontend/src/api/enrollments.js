// src/api/enrollments.js
import axios from "axios";

export function EnrollmentsAPI(baseUrl) {
  const client = axios.create({
    baseURL: baseUrl,
    withCredentials: true,
  });

  return {
    // Always returns an array of enrollments
    async myEnrollments(params = {}) {
      const { status, page = 1, limit = 12 } = params;
      const { data } = await client.get(`/api/enrollments/mine`, {
        params: { status, page, limit },
      });
      return Array.isArray(data?.data) ? data.data : [];
    },

    // Returns enrollment object or null
    async getMyEnrollmentByCourse(courseId) {
      const { data } = await client.get(`/api/enrollments/by-course/${courseId}`);
      return data?.data ?? null;
    },

    // Returns created enrollment object
    async enrollOpen(courseId) {
      const { data } = await client.post(`/api/enrollments/open`, { courseId });
      return data?.data ?? null;
    },

    // Returns updated progress object
    async markLessonComplete(enrollmentId, { lessonId, timeSpent = 0 }) {
      const { data } = await client.post(
        `/api/enrollments/${enrollmentId}/progress`,
        { lessonId, timeSpent }
      );
      return data?.data ?? null;
    },
  };
}
