import { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useProfileStore } from '../../store/useProfileStore';
import { useStoryStore } from '../../store/useStoryStore';
import { logger } from '../../utils/debug'; // Import logger

/**
 * Debug panel for development mode that shows current state
 * Can be toggled with Ctrl+Shift+D
 */
export function DebugPanel() {
  const [isVisible, setIsVisible] = useState(false);

  // App store state
  const { isLoading, error } = useAppStore();

  // Profile store state
  const { profiles, activeProfileId } = useProfileStore();

  // Story store state
  // Removed unused state variables like 'currentSegment', 'isPlaying', 'segments', 'questions'
  // Add them back if they become needed for display here.
  const { theme, isGenerating, progress } = useStoryStore();

  // Toggle panel with Ctrl+Shift+D keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Don't render in production or if not visible
  if (!import.meta.env.DEV || !isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-[80vh] overflow-auto bg-slate-900 text-slate-200 p-3 rounded-md shadow-lg z-50 text-xs">
      <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-700">
        <h2 className="font-bold">Debug Panel</h2>
        <button onClick={() => setIsVisible(false)} className="text-slate-400 hover:text-white">
          Close
        </button>
      </div>

      <div className="space-y-3">
        {/* App State */}
        <div>
          <h3 className="font-semibold text-blue-400 mb-1">App State</h3>
          <div className="pl-2">
            <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
            {error && <div className="text-red-400">Error: {error}</div>}
          </div>
        </div>

        {/* Profile State */}
        <div>
          <h3 className="font-semibold text-blue-400 mb-1">Profile State</h3>
          <div className="pl-2">
            <div>Active Profile: {activeProfileId || 'None'}</div>
            <div>Profile Count: {profiles.length}</div>
            {profiles.length > 0 && (
              <details>
                <summary className="cursor-pointer text-slate-400">View Profiles</summary>
                <pre className="mt-1 p-1 bg-slate-800 rounded overflow-auto">
                  {JSON.stringify(profiles, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>

        {/* Story State */}
        <div>
          <h3 className="font-semibold text-blue-400 mb-1">Story State</h3>
          <div className="pl-2">
            <div>Theme: {theme || 'None'}</div>
            <div>Generating: {isGenerating ? 'Yes' : 'No'}</div>
            {/* Removed display for unused state variables */}
            {/* <div>Segments: {segments.length}</div> */}
            {/* <div>Questions: {questions.length}</div> */}

            {/* Add back details for currentSegment if needed */}

            {progress.length > 0 && (
              <details>
                <summary className="cursor-pointer text-slate-400">Progress</summary>
                <pre className="mt-1 p-1 bg-slate-800 rounded overflow-auto">
                  {JSON.stringify(progress, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>

        {/* Performance Actions (e.g., Clear Console) */}
        <div>
          <h3 className="font-semibold text-blue-400 mb-1">Actions</h3>
          <button
            onClick={() => {
              // Disable rule for specific console action
              // eslint-disable-next-line no-console
              console.clear();
              // Use logger for the informational message
              logger.info('Console cleared by Debug Panel');
            }}
            className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded"
          >
            Clear Console
          </button>
        </div>
      </div>
    </div>
  );
}
