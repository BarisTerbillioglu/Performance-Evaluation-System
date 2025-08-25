import React from 'react';
import { Button } from '../../components/design-system/Button';
import { useNavigate } from 'react-router-dom';

// 404 Not Found Page
export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-4xl font-bold text-primary-600">404</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved. Please check the URL or navigate to a different page.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            onClick={() => navigate('/')}
            className="w-full"
            size="lg"
          >
            Go to Dashboard
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            className="w-full"
          >
            Go Back
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-sm text-gray-500 mt-8">
          If you believe this is an error, please contact support.
        </p>
      </div>
    </div>
  );
};

// 500 Internal Server Error Page
export const ServerErrorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Server Error
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-8">
          We're experiencing technical difficulties. Our team has been notified and is working to resolve this issue. Please try again in a few minutes.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            onClick={() => window.location.reload()}
            className="w-full"
            size="lg"
          >
            Try Again
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => navigate('/')}
            className="w-full"
          >
            Go to Dashboard
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-sm text-gray-500 mt-8">
          If the problem persists, please contact our support team.
        </p>
      </div>
    </div>
  );
};

// Network Error Page
export const NetworkErrorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Network Icon */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Network Error
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-8">
          Unable to connect to the server. Please check your internet connection and try again.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            onClick={() => window.location.reload()}
            className="w-full"
            size="lg"
          >
            Retry Connection
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => navigate('/')}
            className="w-full"
          >
            Go to Dashboard
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-sm text-gray-500 mt-8 space-y-2">
          <p>If the problem continues:</p>
          <ul className="text-left space-y-1">
            <li>• Check your internet connection</li>
            <li>• Try refreshing the page</li>
            <li>• Contact your network administrator</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Access Denied Page
export const AccessDeniedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Lock Icon */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Access Denied
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-8">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            onClick={() => navigate('/')}
            className="w-full"
            size="lg"
          >
            Go to Dashboard
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => navigate('/profile')}
            className="w-full"
          >
            View Profile
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-sm text-gray-500 mt-8">
          Need help? Contact your system administrator.
        </p>
      </div>
    </div>
  );
};

// Maintenance Page
export const MaintenancePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Maintenance Icon */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Under Maintenance
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-8">
          We're currently performing scheduled maintenance to improve our services. Please check back later.
        </p>

        {/* Estimated Time */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-blue-800">
            <strong>Estimated completion:</strong> 2 hours
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            onClick={() => window.location.reload()}
            className="w-full"
            size="lg"
          >
            Check Status
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-sm text-gray-500 mt-8">
          For urgent matters, please contact support.
        </p>
      </div>
    </div>
  );
};

// Generic Error Page
export const GenericErrorPage: React.FC<{
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}> = ({ 
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  icon,
  actions 
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
            {icon || (
              <svg
                className="w-12 h-12 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {title}
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-8">
          {message}
        </p>

        {/* Action Buttons */}
        {actions || (
          <div className="space-y-4">
            <Button
              onClick={() => navigate('/')}
              className="w-full"
              size="lg"
            >
              Go to Dashboard
            </Button>
            
            <Button
              variant="secondary"
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Help Text */}
        <p className="text-sm text-gray-500 mt-8">
          If the problem persists, please contact support.
        </p>
      </div>
    </div>
  );
};
