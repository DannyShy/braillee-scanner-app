import { useEffect } from 'react';

const useLogMount = (componentName: string): void => {
  useEffect(() => {
    window.electronAPI.log('debug', `${componentName} component mounted.`);
    return () => {
      window.electronAPI.log('debug', `${componentName} component unmounted.`);
    };
  }, []);
};

export default useLogMount;
