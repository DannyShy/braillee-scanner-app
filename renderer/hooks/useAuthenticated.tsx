import { useEffect } from 'react';
import { useRouter } from 'next/router';
import useUser from './useUser';

const useAuthenticated = () => {
  const router = useRouter();
  const { user, userLoaded, userLoading, loadUser } = useUser();
  const license = user?.licenses?.find((license) => license.product === 'dotsight');

  useEffect(() => {
    console.log('useAuthenticated', user, userLoaded);
    if (userLoaded && !user) {
      router.push('/login');
    } else if (userLoaded && user && !license?.active) {
      router.push('/no-license');
    }

    if (!userLoading && !userLoaded) {
      void loadUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userLoaded, userLoading]);

  return { user, userLoaded, userLoading };
};

export default useAuthenticated;
