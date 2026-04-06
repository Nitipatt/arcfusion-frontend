/**
 * Tests for the API client module.
 */

import { fetchStories, sendQuery, exportSlides } from "@/lib/api";

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("API Client", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe("fetchStories", () => {
    it("should fetch dashboard stories successfully", async () => {
      const mockData = {
        latest_stories: [
          { id: "1", title: "Test Story", description: "Desc" },
        ],
        older_stories: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await fetchStories();
      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/dashboard/stories",
        { cache: "no-store", headers: {} }
      );
    });

    it("should throw on fetch error", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
      await expect(fetchStories()).rejects.toThrow("Failed to fetch stories");
    });
  });

  describe("sendQuery", () => {
    it("should send a chat query with session ID", async () => {
      const mockResponse = {
        session_id: "session-123",
        user_query: "test query",
        insight_title: "Title",
        narrative_summary: "Summary",
        recommended_actions: [],
        echarts_config: {},
        raw_data: [],
        error: null,
        generated_sql: "SELECT 1",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await sendQuery("test query", "session-123");
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/chat",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            query: "test query", 
            session_id: "session-123",
            history: []
          }),
        })
      );
    });

    it("should send query without session ID", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ session_id: "new-session" }),
      });

      await sendQuery("test query");
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/chat",
        expect.objectContaining({
          body: JSON.stringify({ query: "test query", session_id: "", history: [] }),
        })
      );
    });

    it("should throw on send error", async () => {
      mockFetch.mockResolvedValueOnce({ 
        ok: false, 
        status: 503,
        json: async () => { throw new Error("parse error"); }
      });
      await expect(sendQuery("test")).rejects.toThrow("Failed to send query");
    });
  });

  describe("exportSlides", () => {
    it("should export slides and return a blob", async () => {
      const mockBlob = new Blob(["test"], { type: "application/pptx" });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      });

      const result = await exportSlides({
        title: "Test",
        summary: "Summary",
        recommended_actions: ["a", "b", "c"],
        echarts_config: {},
      });

      expect(result).toEqual(mockBlob);
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/export/slides",
        expect.objectContaining({ method: "POST" })
      );
    });

    it("should throw on export error", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 501 });
      await expect(
        exportSlides({
          title: "T",
          summary: "S",
          recommended_actions: [],
          echarts_config: {},
        })
      ).rejects.toThrow("Failed to export slides");
    });
  });
});
