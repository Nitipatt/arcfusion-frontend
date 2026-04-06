/**
 * @jest-environment jsdom
 */
import { renderHook, act } from "@testing-library/react";
import { useSessionStore } from "@/store/sessionStore";

describe("sessionStore", () => {
  beforeEach(() => {
    // Reset store between tests
    useSessionStore.setState({
      sessionId: "",
      threads: [],
      activeThreadId: null,
    });
  });

  it("should initialize with empty state", () => {
    const { result } = renderHook(() => useSessionStore());
    expect(result.current.sessionId).toBe("");
    expect(result.current.threads).toEqual([]);
    expect(result.current.activeThreadId).toBeNull();
  });

  it("should set session ID", () => {
    const { result } = renderHook(() => useSessionStore());
    act(() => result.current.setSessionId("test-session-123"));
    expect(result.current.sessionId).toBe("test-session-123");
  });

  it("should add a thread and set it as active", () => {
    const { result } = renderHook(() => useSessionStore());
    let threadId: string;

    act(() => {
      threadId = result.current.addThread("Test query");
    });

    expect(result.current.threads).toHaveLength(1);
    expect(result.current.threads[0].query).toBe("Test query");
    expect(result.current.threads[0].loading).toBe(true);
    expect(result.current.threads[0].response).toBeNull();
    expect(result.current.activeThreadId).toBe(threadId!);
  });

  it("should set thread response and update session ID", () => {
    const { result } = renderHook(() => useSessionStore());
    let threadId: string;

    act(() => {
      threadId = result.current.addThread("Test query");
    });

    const mockResponse = {
      session_id: "new-session-456",
      user_query: "Test query",
      generated_sql: "SELECT 1",
      insight_title: "Test Title",
      narrative_summary: "Test summary",
      recommended_actions: ["Action 1", "Action 2", "Action 3"],
      echarts_config: {},
      raw_data: [],
      error: null,
    };

    act(() => {
      result.current.setThreadResponse(threadId!, mockResponse);
    });

    expect(result.current.threads[0].loading).toBe(false);
    expect(result.current.threads[0].response).toEqual(mockResponse);
    expect(result.current.sessionId).toBe("new-session-456");
  });

  it("should set thread loading state", () => {
    const { result } = renderHook(() => useSessionStore());
    let threadId: string;

    act(() => {
      threadId = result.current.addThread("Test");
    });

    act(() => {
      result.current.setThreadLoading(threadId!, false);
    });

    expect(result.current.threads[0].loading).toBe(false);
  });

  it("should get active thread", () => {
    const { result } = renderHook(() => useSessionStore());

    act(() => {
      result.current.addThread("Query 1");
      result.current.addThread("Query 2");
    });

    const activeThread = result.current.getActiveThread();
    expect(activeThread?.query).toBe("Query 2");
  });

  it("should handle multiple threads", () => {
    const { result } = renderHook(() => useSessionStore());

    act(() => {
      result.current.addThread("Query 1");
      result.current.addThread("Query 2");
      result.current.addThread("Query 3");
    });

    expect(result.current.threads).toHaveLength(3);
  });
});
