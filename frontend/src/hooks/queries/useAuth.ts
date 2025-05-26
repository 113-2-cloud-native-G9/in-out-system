import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi, LoginCredentials } from '@/services/api/auth';
import { useUser } from '@/providers/authProvider';

// Query Keys
export const authKeys = {
  all: ['auth'] as const,
  login: () => [...authKeys.all, 'login'] as const,
};

// 登入 Mutation
export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { login: contextLogin } = useUser();
  
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      // 使用現有的 authProvider 登入邏輯
      await contextLogin(credentials);
      return true;
    },
    onSuccess: () => {
      // 導向主頁
      navigate('/attendance');
    },
    onError: (error) => {
      console.error('Login failed:', error);
      throw error;
    },
  });
};

// 登出功能
export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { logout: contextLogout } = useUser();
  
  return {
    logout: () => {
      // 使用現有的 authProvider 登出邏輯
      contextLogout();
      
      // 清除所有快取
      queryClient.clear();
      
      // 導向登入頁
      navigate('/login');
    }
  };
};
