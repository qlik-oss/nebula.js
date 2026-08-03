import '@testing-library/jest-dom';
import 'whatwg-fetch';
import 'jest-location-mock';
import { TextEncoder, TextDecoder } from 'util';

Object.assign(global, { TextDecoder, TextEncoder });

// Global mock for react-router to avoid ESM import.meta issues in jest-environment-jsdom
jest.mock('react-router', () => ({
  BrowserRouter: ({ children }) => children,
  Routes: ({ children }) => children,
  Route: () => null,
  Outlet: () => null,
  useNavigate: jest.fn(() => jest.fn()),
  useLocation: jest.fn(() => ({ pathname: '/' })),
}));
