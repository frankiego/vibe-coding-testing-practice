import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginPage } from '../LoginPage';
import * as AuthContext from '../../context/AuthContext';
import * as RouterDom from 'react-router-dom';

// Mock dependencies
vi.mock('../../context/AuthContext');
vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(),
}));

describe('LoginPage', () => {
    const mockLogin = vi.fn();
    const mockNavigate = vi.fn();
    const mockClearAuthExpiredMessage = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        
        // Setup default mock values
        (RouterDom.useNavigate as any).mockReturnValue(mockNavigate);
        (AuthContext.useAuth as any).mockReturnValue({
            login: mockLogin,
            isAuthenticated: false,
            authExpiredMessage: '',
            clearAuthExpiredMessage: mockClearAuthExpiredMessage,
        });
    });

    describe('【前端元素】', () => {
        it('檢查登入頁面元件渲染', () => {
            render(<LoginPage />);
            
            expect(screen.getByText('歡迎回來')).toBeInTheDocument();
            expect(screen.getByLabelText('電子郵件')).toBeInTheDocument();
            expect(screen.getByLabelText('密碼')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '登入' })).toBeInTheDocument();
        });
    });

    describe('【驗證邏輯】', () => {
        it('檢查 Email 格式驗證', () => {
            render(<LoginPage />);
            
            const emailInput = screen.getByLabelText('電子郵件');
            const submitButton = screen.getByRole('button', { name: '登入' });

            fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
            fireEvent.click(submitButton);

            expect(screen.getByText('請輸入有效的 Email 格式')).toBeInTheDocument();
            expect(mockLogin).not.toHaveBeenCalled();
        });

        it('檢查密碼長度驗證', () => {
            render(<LoginPage />);
            
            const passwordInput = screen.getByLabelText('密碼');
            const submitButton = screen.getByRole('button', { name: '登入' });

            fireEvent.change(passwordInput, { target: { value: 'pass' } });
            fireEvent.click(submitButton);

            expect(screen.getByText('密碼必須至少 8 個字元')).toBeInTheDocument();
            expect(mockLogin).not.toHaveBeenCalled();
        });

        it('檢查密碼複雜度驗證', () => {
            render(<LoginPage />);
            
            const passwordInput = screen.getByLabelText('密碼');
            const submitButton = screen.getByRole('button', { name: '登入' });

            // Only numbers
            fireEvent.change(passwordInput, { target: { value: '12345678' } });
            fireEvent.click(submitButton);
            expect(screen.getByText('密碼必須包含英文字母和數字')).toBeInTheDocument();

            // Only letters
            fireEvent.change(passwordInput, { target: { value: 'abcdefgh' } });
            fireEvent.click(submitButton);
            expect(screen.getByText('密碼必須包含英文字母和數字')).toBeInTheDocument();
            
            expect(mockLogin).not.toHaveBeenCalled();
        });

        it('成功登入流程', async () => {
            render(<LoginPage />);
            
            const emailInput = screen.getByLabelText('電子郵件');
            const passwordInput = screen.getByLabelText('密碼');
            const submitButton = screen.getByRole('button', { name: '登入' });

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            
            mockLogin.mockResolvedValueOnce(undefined);
            
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
                expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
            });
        });

        it('登入失敗處理', async () => {
            render(<LoginPage />);
            
            const emailInput = screen.getByLabelText('電子郵件');
            const passwordInput = screen.getByLabelText('密碼');
            const submitButton = screen.getByRole('button', { name: '登入' });

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            
            const errorMessage = '帳號或密碼錯誤';
            const errorObj = {
                isAxiosError: true,
                response: { data: { message: errorMessage } }
            };
            mockLogin.mockRejectedValueOnce(errorObj);
            
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(errorMessage)).toBeInTheDocument();
            });
        });
    });

    describe('【UI 狀態】', () => {
        it('登入載入狀態', async () => {
            render(<LoginPage />);
            
            const emailInput = screen.getByLabelText('電子郵件');
            const passwordInput = screen.getByLabelText('密碼');
            const submitButton = screen.getByRole('button', { name: '登入' });

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            
            // Return a promise that doesn't resolve immediately
            mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
            
            fireEvent.click(submitButton);

            expect(submitButton).toBeDisabled();
            expect(screen.getByText('登入中...')).toBeInTheDocument();
            
            await waitFor(() => {
                expect(submitButton).not.toBeDisabled();
            });
        });

        it('顯示認證過期訊息', () => {
            (AuthContext.useAuth as any).mockReturnValue({
                isAuthenticated: false,
                authExpiredMessage: '連線逾時',
                clearAuthExpiredMessage: mockClearAuthExpiredMessage,
            });

            render(<LoginPage />);

            expect(screen.getByText('連線逾時')).toBeInTheDocument();
            expect(mockClearAuthExpiredMessage).toHaveBeenCalled();
        });
    });

    describe('【驗證權限】', () => {
        it('已登入狀態導向', () => {
            (AuthContext.useAuth as any).mockReturnValue({
                isAuthenticated: true, // User is already logged in
                authExpiredMessage: '',
                clearAuthExpiredMessage: mockClearAuthExpiredMessage,
            });

            render(<LoginPage />);

            expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
        });
    });
});
