import { useState } from 'react';
import { getCurrentUser } from 'api/auth';
import { User } from 'types/auth';

const useUser = (): { user: User | null; userLoaded: boolean; userLoading: boolean; loadUser: () => Promise<void> } => {
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(false);
  const [userLoaded, setUserLoaded] = useState(false);

  const loadUser = async () => {
    setUserLoading(true);
    setUserLoaded(false);

    try {
      const fetchedUser = await getCurrentUser();
      setUser(fetchedUser);
    } catch (e) {
      console.error(e);
    } finally {
      setUserLoaded(true);
      setUserLoading(false);
    }
  };

  return { user, userLoaded, userLoading, loadUser };
};

export default useUser;
