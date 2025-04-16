import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { startOfMonth, format } from 'date-fns';

@Injectable()
export class AnalyticsService {
    constructor(
        private readonly prismaService: PrismaService
    ){}

    async getUserAnalytics(userId: string) {

        const totalListings = await this.prismaService.product.count({
            where: {
                sellerId: userId
            }
        });
        const totalSoldListings = await this.prismaService.order.count({
            where: {
                product: {
                    sellerId: userId
                },
                status: 'COMPLETED'
            }
        });
        const totalViews = await this.prismaService.product.aggregate({
            _sum: {
                views: true
            },
            where: {
                sellerId: userId
            }
        });
        const totalSoldOrders = await this.prismaService.order.aggregate({
            _sum: {
                amount: true
            },
            where: {
                product: {
                    sellerId: userId
                },
                status: 'COMPLETED'
            }
        });

        const viewsPerProduct = async () => {
            const products = await this.prismaService.product.findMany({
                where: {
                    sellerId: userId
                },
                take: 10,
                orderBy: {
                    views: 'desc'
                },
            });

            return products.map(product => ({
                id: product.id,
                name: product.title,
                views: product.views
            }));
        }

        const soldOrdersPerMonth = async () => {
            const orders = await this.prismaService.order.findMany({
                where: {
                  product: {
                    sellerId: userId,
                  },
                  status: 'COMPLETED',
                },
                select: {
                  createdAt: true,
                  amount: true,
                },
                orderBy: {
                  createdAt: 'asc',
                },
            });
            
            // Initialize with all months of 2025
            const monthlyData = [
                { month: "2025-01", monthlySold: 0 },
                { month: "2025-02", monthlySold: 0 },
                { month: "2025-03", monthlySold: 0 },
                { month: "2025-04", monthlySold: 0 },
                { month: "2025-05", monthlySold: 0 },
                { month: "2025-06", monthlySold: 0 },
                { month: "2025-07", monthlySold: 0 },
                { month: "2025-08", monthlySold: 0 },
                { month: "2025-09", monthlySold: 0 },
                { month: "2025-10", monthlySold: 0 },
                { month: "2025-11", monthlySold: 0 },
                { month: "2025-12", monthlySold: 0 }
            ];
            
            // Fill in with actual data
            for (const order of orders) {
                const monthKey = format(startOfMonth(order.createdAt), 'yyyy-MM');
                const monthEntry = monthlyData.find(entry => entry.month === monthKey);
                if (monthEntry) {
                    monthEntry.monthlySold += order.amount / 100;
                }
            }
            
            return monthlyData;
        };

        const soldOrdersPerMonthResult = await soldOrdersPerMonth();
        const viewsPerProductResult = await viewsPerProduct();

        return {
            totalListings,
            totalSoldListings,
            totalViews: totalViews._sum.views || 0,
            totalSoldOrders: totalSoldOrders._sum.amount || 0,
            viewsPerProductResult,
            soldOrdersPerMonthResult
        }

    }
}