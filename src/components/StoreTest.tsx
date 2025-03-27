import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useProfileStore, Profile } from '../store/useProfileStore';
import { useStoryStore, StoryProgress } from '../store/useStoryStore';
import { useComponentDebug } from '../hooks/useComponentDebug';
import { performanceMonitor } from '../utils/performance';
import { logger } from '../utils/debug';
import { ErrorTest } from './debug/ErrorTest';
import { ErrorBoundary } from './debug/ErrorBoundary';

export function StoreTest() {
  // Debug component lifecycle
  useComponentDebug('StoreTest');

  // App store
  const { isLoading, error, setLoading, setError, clearError } = useAppStore();

  // Profile store
  const {
    profiles,
    activeProfileId,
    addProfile,
    updateProfile,
    deleteProfile,
    setActiveProfile,
    getActiveProfile,
  } = useProfileStore();

  // Story store
  const { theme, isGenerating, startStory, completeStory, resetCurrentStory, progress } =
    useStoryStore();

  // Run some performance tests on mount
  useEffect(() => {
    // Example of tracking a synchronous operation
    performanceMonitor.start('storeTest-mount');

    // Simulate some work
    const array = Array.from({ length: 1000 }, (_, i) => i);
    const sum = array.reduce((a, b) => a + b, 0);

    logger.info('StoreTest component mounted', { sum });

    performanceMonitor.end('storeTest-mount');

    return () => {
      logger.info('StoreTest component unmounted');
    };
  }, []);

  // Test function for profile store
  const handleAddProfile = performanceMonitor.track(() => {
    addProfile({
      name: `User ${profiles.length + 1}`,
      avatar: `avatar-${Math.floor(Math.random() * 5) + 1}`,
    });
  }, 'addProfile');

  // Test function for app store
  const toggleLoading = () => {
    setLoading(!isLoading);
  };

  // Test function for error handling
  const setTestError = () => {
    setError('This is a test error');
    setTimeout(clearError, 3000);
  };

  // Test function for story
  const handleStartStory = performanceMonitor.track(() => {
    if (activeProfileId) {
      startStory(activeProfileId, 'Adventure in the Forest');
    } else {
      setError('Please select a profile first');
    }
  }, 'startStory');

  return (
    <div className="p-4 space-y-6">
      <div className="border p-4 rounded-md">
        <h2 className="text-xl font-bold mb-2">App Store Test</h2>
        <div className="flex space-x-2 mb-2">
          <button
            onClick={toggleLoading}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {isLoading ? 'Stop Loading' : 'Start Loading'}
          </button>
          <button
            onClick={setTestError}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Test Error
          </button>
        </div>
        {isLoading && <p className="text-blue-500">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
      </div>

      <div className="border p-4 rounded-md">
        <h2 className="text-xl font-bold mb-2">Profile Store Test</h2>
        <div className="flex space-x-2 mb-2">
          <button
            onClick={handleAddProfile}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Add Profile
          </button>
        </div>
        <div className="space-y-2">
          <p>Active Profile: {activeProfileId ? getActiveProfile()?.name : 'None'}</p>
          <h3 className="font-semibold">Profiles:</h3>
          <ul className="space-y-2">
            {profiles.map((profile: Profile) => (
              <li
                key={profile.id}
                className={`flex justify-between items-center p-2 border rounded ${
                  profile.id === activeProfileId ? 'bg-blue-100' : ''
                }`}
              >
                <span>
                  {profile.name} (Avatar: {profile.avatar})
                </span>
                <div className="space-x-2">
                  <button
                    onClick={() => setActiveProfile(profile.id)}
                    className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
                  >
                    Select
                  </button>
                  <button
                    onClick={() => deleteProfile(profile.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border p-4 rounded-md">
        <h2 className="text-xl font-bold mb-2">Story Store Test</h2>
        <div className="flex space-x-2 mb-2">
          <button
            onClick={handleStartStory}
            className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
            disabled={!activeProfileId}
          >
            Start Story
          </button>
          <button
            onClick={() => activeProfileId && completeStory(activeProfileId)}
            className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
            disabled={!activeProfileId || !theme}
          >
            Complete Story
          </button>
          <button
            onClick={resetCurrentStory}
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Reset Story
          </button>
        </div>
        <div>
          <p>Current Theme: {theme || 'None'}</p>
          <p>Generating: {isGenerating ? 'Yes' : 'No'}</p>

          <h3 className="font-semibold mt-2">Progress:</h3>
          <ul className="space-y-1">
            {progress.map((p: StoryProgress, index: number) => (
              <li key={index} className="text-sm">
                Profile: {p.profileId} - Theme: {p.theme} -
                {p.completedAt ? (
                  <span className="text-green-500"> Completed</span>
                ) : (
                  <span className="text-orange-500"> In Progress</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Error handling test */}
      <ErrorBoundary>
        <ErrorTest />
      </ErrorBoundary>
    </div>
  );
}
