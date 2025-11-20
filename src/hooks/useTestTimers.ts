import { useState, useEffect, useCallback, useRef } from "react";
import { useSubmitTest } from "./useTestResponses";

interface ActiveTimer {
    testResponseId: string;
    startedAt: number; // timestamp in milliseconds
    duration: number; // duration in minutes
    processId: string;
    workerProcessId: string;
}

interface TimerState {
    [testResponseId: string]: ActiveTimer;
}

const STORAGE_KEY = 'active_test_timers';

// Global interval reference to ensure only one interval runs
let globalIntervalId: number | null = null;
let intervalCallbacks: Map<string, () => void> = new Map();

/**
 * Hook to manage global test timers that run independently of component lifecycle
 * Timers persist in localStorage and auto-submit tests when time expires
 */
export const useTestTimers = () => {
    const [timers, setTimers] = useState<TimerState>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : {};
        } catch {
            return {};
        }
    });

    const submitMutation = useSubmitTest();
    const submitMutationRef = useRef(submitMutation);

    // Keep submitMutation ref updated
    useEffect(() => {
        submitMutationRef.current = submitMutation;
    }, [submitMutation]);

    // Persist timers to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
    }, [timers]);

    /**
     * Register a new test timer
     * Only updates if timer doesn't exist or values changed
     */
    const registerTimer = useCallback((
        testResponseId: string,
        startedAt: number,
        duration: number,
        processId: string,
        workerProcessId: string
    ) => {
        setTimers(prev => {
            const existing = prev[testResponseId];

            // If timer already exists with same values, don't update
            if (existing &&
                existing.startedAt === startedAt &&
                existing.duration === duration &&
                existing.processId === processId &&
                existing.workerProcessId === workerProcessId) {
                return prev; // Return same reference to avoid re-render
            }

            // Otherwise, create/update timer
            return {
                ...prev,
                [testResponseId]: {
                    testResponseId,
                    startedAt,
                    duration,
                    processId,
                    workerProcessId
                }
            };
        });
    }, []);

    /**
     * Remove a test timer (when test is submitted or cancelled)
     */
    const removeTimer = useCallback((testResponseId: string) => {
        setTimers(prev => {
            const newTimers = { ...prev };
            delete newTimers[testResponseId];
            return newTimers;
        });

        // Also remove from interval callbacks
        intervalCallbacks.delete(testResponseId);
    }, []);

    /**
     * Get time left for a specific test in seconds
     */
    const getTimeLeft = useCallback((testResponseId: string): number | null => {
        const timer = timers[testResponseId];
        if (!timer) return null;

        const durationMs = timer.duration * 60 * 1000;
        const elapsed = Date.now() - timer.startedAt;
        const remaining = Math.max(0, durationMs - elapsed);

        return Math.floor(remaining / 1000);
    }, [timers]);

    /**
     * Auto-submit a test when time expires
     */
    const autoSubmitTest = useCallback(async (testResponseId: string) => {
        console.log(`⏰ Auto-submitting test ${testResponseId} - time expired`);

        try {
            // Get answers from localStorage if they exist
            const savedProgress = localStorage.getItem(`test_progress_answers_${testResponseId}`);
            const answers = savedProgress ? JSON.parse(savedProgress) : [];

            // Submit with whatever answers exist (even if empty)
            await submitMutationRef.current.mutateAsync({
                responseId: testResponseId,
                data: { answers }
            });

            console.log(`✅ Test ${testResponseId} auto-submitted successfully`);

            // Remove timer after successful submit
            removeTimer(testResponseId);
        } catch (error) {
            console.error(`❌ Error auto-submitting test ${testResponseId}:`, error);
            // Don't remove timer if submit failed - it will retry next interval
        }
    }, [removeTimer]);

    /**
     * Check all timers and auto-submit expired ones
     * Use ref to avoid recreating this function on every timer change
     */
    const timersRef = useRef(timers);
    useEffect(() => {
        timersRef.current = timers;
    }, [timers]);

    const checkTimers = useCallback(() => {
        const now = Date.now();
        const currentTimers = timersRef.current;

        Object.values(currentTimers).forEach(timer => {
            const durationMs = timer.duration * 60 * 1000;
            const elapsed = now - timer.startedAt;

            // If time has expired
            if (elapsed >= durationMs) {
                // Check if we haven't already triggered submit for this timer
                if (!intervalCallbacks.has(timer.testResponseId)) {
                    intervalCallbacks.set(timer.testResponseId, () => {});
                    autoSubmitTest(timer.testResponseId);
                }
            }
        });
    }, [autoSubmitTest]);

    /**
     * Set up global interval to check timers
     */
    useEffect(() => {
        // Only set up interval if there are active timers
        const hasTimers = Object.keys(timers).length > 0;

        if (!hasTimers) {
            if (globalIntervalId) {
                clearInterval(globalIntervalId);
                globalIntervalId = null;
            }
            return;
        }

        // Set up interval if not already running
        if (!globalIntervalId) {
            globalIntervalId = setInterval(checkTimers, 1000);
        }

        // Check immediately on mount/update
        checkTimers();

        // Don't clear interval on unmount - it's global!
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timers]);

    return {
        registerTimer,
        removeTimer,
        getTimeLeft,
        activeTimers: timers
    };
};
