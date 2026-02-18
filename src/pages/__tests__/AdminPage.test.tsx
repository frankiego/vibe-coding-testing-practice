import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminPage } from '../AdminPage';
import * as AuthContext from '../../context/AuthContext';
import * as RouterDom from 'react-router-dom';

// Mock dependencies
vi.mock('../../context/AuthContext');
vi.mock('react-router-dom', () => ({
    ...vi.importActual('react-router-dom'),
    useNavigate: vi.fn(),
    Link: ({ to, children, className }: any) => <a href={to} className={className}>{children}</a>,
}));

describe('AdminPage', () => {
    const mockLogout = vi.fn();
    const mockNavigate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        (RouterDom.useNavigate as any).mockReturnValue(mockNavigate);
        (AuthContext.useAuth as any).mockReturnValue({
            user: { username: 'admin_user', role: 'admin' },
            logout: mockLogout,
        });
    });

    describe('【前端元素】', () => {
        it('檢查 Admin 頁面基本渲染', () => {
            render(<AdminPage />);

            expect(screen.getByText(/管理後台/)).toBeInTheDocument();
            expect(screen.getByText('← 返回')).toBeInTheDocument();
            expect(screen.getByText('登出')).toBeInTheDocument();
            expect(screen.getByText('管理員專屬頁面')).toBeInTheDocument();
        });
    });

    describe('【驗證權限】', () => {
        it('檢查角色標籤顯示', () => {
            render(<AdminPage />);
            expect(screen.getByText('管理員')).toBeInTheDocument();
        });
    });

    describe('【function 邏輯】', () => {
        it('登出功能', () => {
            render(<AdminPage />);

            const logoutButton = screen.getByText('登出');
            fireEvent.click(logoutButton);

            expect(mockLogout).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true, state: null });
        });
    });

    describe('【路由導航】', () => {
        it('返回儀表板', () => {
            render(<AdminPage />);

            const backLink = screen.getByText('← 返回');
            expect(backLink).toHaveAttribute('href', '/dashboard');
        });
    });
});
