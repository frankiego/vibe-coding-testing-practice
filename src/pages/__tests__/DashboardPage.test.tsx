import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardPage } from '../DashboardPage';
import * as AuthContext from '../../context/AuthContext';
import * as RouterDom from 'react-router-dom';
import { productApi } from '../../api/productApi';

// Mock dependencies
vi.mock('../../context/AuthContext');
vi.mock('../../api/productApi');
vi.mock('react-router-dom', () => ({
    ...vi.importActual('react-router-dom'),
    useNavigate: vi.fn(),
    Link: ({ to, children, className }: any) => <a href={to} className={className}>{children}</a>,
}));

describe('DashboardPage', () => {
    const mockLogout = vi.fn();
    const mockNavigate = vi.fn();

    const mockProducts = [
        { id: 1, name: 'Product A', price: 100, description: 'Desc A' },
        { id: 2, name: 'Product B', price: 200, description: 'Desc B' },
    ];

    beforeEach(() => {
        vi.clearAllMocks();

        (RouterDom.useNavigate as any).mockReturnValue(mockNavigate);
        (AuthContext.useAuth as any).mockReturnValue({
            user: { username: 'test_user', role: 'user' },
            logout: mockLogout,
        });
    });

    describe('【前端元素】', () => {
        it('檢查儀表板頁面基本渲染', async () => {
            (productApi.getProducts as any).mockResolvedValue(mockProducts);

            render(<DashboardPage />);

            await waitFor(() => {
                expect(screen.getByText('儀表板')).toBeInTheDocument();
                expect(screen.getByText('Welcome, test_user 👋')).toBeInTheDocument();
                expect(screen.getByText('商品列表')).toBeInTheDocument();
            });
        });
    });

    describe('【驗證權限】', () => {
        it('Admin 連結顯示 (Admin 角色)', async () => {
            (AuthContext.useAuth as any).mockReturnValue({
                user: { username: 'admin_user', role: 'admin' },
                logout: mockLogout,
            });
            (productApi.getProducts as any).mockResolvedValue(mockProducts);

            render(<DashboardPage />);

            await waitFor(() => {
                expect(screen.getByText('🛠️ 管理後台')).toBeInTheDocument();
            });
        });

        it('Admin 連結隱藏 (一般用戶)', async () => {
            (AuthContext.useAuth as any).mockReturnValue({
                user: { username: 'normal_user', role: 'user' },
                logout: mockLogout,
            });
            (productApi.getProducts as any).mockResolvedValue(mockProducts);

            render(<DashboardPage />);

            await waitFor(() => {
                expect(screen.queryByText('🛠️ 管理後台')).not.toBeInTheDocument();
            });
        });
    });

    describe('【function 邏輯】', () => {
        it('登出功能', async () => {
            (productApi.getProducts as any).mockResolvedValue(mockProducts);
            render(<DashboardPage />);

            const logoutButton = await screen.findByText('登出');
            fireEvent.click(logoutButton);

            expect(mockLogout).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true, state: null });
        });
    });

    describe('【UI 狀態】', () => {
        it('商品列表載入中', () => {
            // Return a promise that never resolves (or takes a long time) to test loading state
            (productApi.getProducts as any).mockReturnValue(new Promise(() => { }));

            render(<DashboardPage />);

            expect(screen.getByText('載入商品中...')).toBeInTheDocument();
        });
    });

    describe('【Mock API】', () => {
        it('商品列表載入成功', async () => {
            (productApi.getProducts as any).mockResolvedValue(mockProducts);

            render(<DashboardPage />);

            await waitFor(() => {
                expect(screen.getByText('Product A')).toBeInTheDocument();
                expect(screen.getByText('Product B')).toBeInTheDocument();
                expect(screen.getByText('NT$ 100')).toBeInTheDocument();
                expect(screen.getByText('NT$ 200')).toBeInTheDocument();
            });
        });

        it('商品列表載入失敗', async () => {
            const errorMessage = 'API Error';
            const errorObj = {
                response: { data: { message: errorMessage } }
            };
            (productApi.getProducts as any).mockRejectedValue(errorObj);

            render(<DashboardPage />);

            await waitFor(() => {
                expect(screen.getByText(errorMessage)).toBeInTheDocument();
            });
        });
    });
});
