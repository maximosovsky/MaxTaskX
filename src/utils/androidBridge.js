export const checkScreenState = async () => {
  try {
    // Check if running in WebView
    if (window.Android) {
      return window.Android.isScreenActive();
    }
    
    // Fallback for web browser: check if page is visible
    return !document.hidden;
  } catch (error) {
    console.error('Failed to check screen state:', error);
    return true; // Default to true if check fails
  }
};

export const showOverlay = () => {
  try {
    if (window.Android) {
      window.Android.showOverlay();
    }
  } catch (error) {
    console.error('Failed to show overlay:', error);
  }
};

export const hideOverlay = () => {
  try {
    if (window.Android) {
      window.Android.hideOverlay();
    }
  } catch (error) {
    console.error('Failed to hide overlay:', error);
  }
};