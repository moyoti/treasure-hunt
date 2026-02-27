import { cookies } from 'next/headers';

export async function getServerSession() {
  const cookieStore = cookies();
  const token = cookieStore.get('token');
  const user = cookieStore.get('user');
  
  if (!token || !user) {
    return null;
  }
  
  try {
    return {
      token: token.value,
      user: JSON.parse(user.value),
    };
  } catch {
    return null;
  }
}