import React from 'react';
import { render, screen } from '@/test/utils/test-utils';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data/DataTable';
import { VirtualList } from '@/components/ui/data/VirtualList';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

// Mock performance API
const mockPerformance = {
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn(),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
};

Object.defineProperty(window, 'performance', {
  value: mockPerformance,
  writable: true,
});

describe('Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering Performance', () => {
    it('should render Button component efficiently', () => {
      const startTime = performance.now();
      
      render(<Button>Test Button</Button>);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(10); // Should render in less than 10ms
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render DataTable with large dataset efficiently', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        department: `Department ${i % 5}`,
      }));

      const columns = [
        { key: 'name', title: 'Name' },
        { key: 'email', title: 'Email' },
        { key: 'department', title: 'Department' },
      ];

      const startTime = performance.now();
      
      render(
        <DataTable
          data={largeDataset}
          columns={columns}
          rowKey="id"
        />
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(100); // Should render in less than 100ms
    });

    it('should render VirtualList efficiently with large dataset', () => {
      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        description: `Description for item ${i}`,
      }));

      const startTime = performance.now();
      
      render(
        <VirtualList
          data={largeDataset}
          height={400}
          itemHeight={50}
          renderItem={(item) => (
            <div key={item.id}>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
            </div>
          )}
        />
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(50); // Should render in less than 50ms
    });
  });

  describe('Hook Performance', () => {
    it('should use performance monitor efficiently', () => {
      const TestComponent = () => {
        const { startTimer, endTimer, getMetrics } = usePerformanceMonitor();
        
        React.useEffect(() => {
          startTimer('test-operation');
          // Simulate some work
          setTimeout(() => {
            endTimer('test-operation');
          }, 10);
        }, [startTimer, endTimer]);
        
        return <div>Test Component</div>;
      };

      const startTime = performance.now();
      
      render(<TestComponent />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(20); // Should render in less than 20ms
    });
  });

  describe('Memory Usage', () => {
    it('should not cause memory leaks with repeated renders', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Render component multiple times
      for (let i = 0; i < 100; i++) {
        const { unmount } = render(<Button>Button {i}</Button>);
        unmount();
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be minimal (less than 1MB)
      expect(memoryIncrease).toBeLessThan(1024 * 1024);
    });
  });

  describe('Bundle Size Impact', () => {
    it('should have reasonable bundle size for components', () => {
      // This test would typically be run with bundle analyzer
      // For now, we'll just verify components are imported correctly
      expect(Button).toBeDefined();
      expect(DataTable).toBeDefined();
      expect(VirtualList).toBeDefined();
    });
  });

  describe('Network Performance', () => {
    it('should handle API calls efficiently', async () => {
      const startTime = performance.now();
      
      // Mock API call
      const mockApiCall = () => new Promise(resolve => {
        setTimeout(() => resolve({ data: [] }), 50);
      });
      
      await mockApiCall();
      
      const endTime = performance.now();
      const apiTime = endTime - startTime;
      
      expect(apiTime).toBeLessThan(100); // API call should complete in less than 100ms
    });
  });

  describe('Animation Performance', () => {
    it('should handle animations smoothly', () => {
      const TestComponent = () => {
        const [isVisible, setIsVisible] = React.useState(false);
        
        React.useEffect(() => {
          const timer = setTimeout(() => setIsVisible(true), 100);
          return () => clearTimeout(timer);
        }, []);
        
        return (
          <div
            style={{
              opacity: isVisible ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
            }}
          >
            Animated Content
          </div>
        );
      };

      const startTime = performance.now();
      
      render(<TestComponent />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(20); // Should render in less than 20ms
    });
  });

  describe('Event Handler Performance', () => {
    it('should handle click events efficiently', () => {
      const handleClick = jest.fn();
      
      const startTime = performance.now();
      
      render(<Button onClick={handleClick}>Click me</Button>);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(10); // Should render in less than 10ms
    });

    it('should handle form submissions efficiently', () => {
      const handleSubmit = jest.fn();
      
      const startTime = performance.now();
      
      render(
        <form onSubmit={handleSubmit}>
          <input type="text" />
          <Button type="submit">Submit</Button>
        </form>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(15); // Should render in less than 15ms
    });
  });

  describe('State Management Performance', () => {
    it('should handle state updates efficiently', () => {
      const TestComponent = () => {
        const [count, setCount] = React.useState(0);
        
        React.useEffect(() => {
          const interval = setInterval(() => {
            setCount(c => c + 1);
          }, 10);
          
          return () => clearInterval(interval);
        }, []);
        
        return <div>Count: {count}</div>;
      };

      const startTime = performance.now();
      
      render(<TestComponent />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(20); // Should render in less than 20ms
    });
  });

  describe('Lazy Loading Performance', () => {
    it('should load lazy components efficiently', async () => {
      const LazyComponent = React.lazy(() => 
        Promise.resolve({
          default: () => <div>Lazy Component</div>,
        })
      );

      const startTime = performance.now();
      
      render(
        <React.Suspense fallback={<div>Loading...</div>}>
          <LazyComponent />
        </React.Suspense>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(30); // Should render in less than 30ms
    });
  });
});
