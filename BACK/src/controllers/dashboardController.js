/**
 * dashboardController.js - Statistiques globales pour le tableau de bord admin.
 * Calcule le chiffre d'affaires, le nombre de commandes, les plats populaires,
 * la répartition par catégorie, les tables actives et les stats d'avis.
 */
const db = require('../config/db');

// Récupération de toutes les statistiques pour le dashboard
const getStats = async (req, res, next) => {
  try {
    const { period } = req.query;
    
    // Chiffre d'affaires et nombre de commandes par type
    const revenueResult = await db.execute(
      `SELECT SUM(total) as total_revenue, COUNT(*) as total_orders,
              SUM(CASE WHEN order_type = 'dine_in' THEN 1 ELSE 0 END) as dine_in_orders,
              SUM(CASE WHEN order_type = 'online' THEN 1 ELSE 0 END) as online_orders,
              SUM(CASE WHEN order_type = 'takeaway' THEN 1 ELSE 0 END) as takeaway_orders
       FROM orders WHERE status != 'cancelled' AND created_at >= SYSDATE - NVL(:period, 30)`
    , [parseInt(period) || 30]);

    // Top 5 des plats les plus vendus
    const popularMealsResult = await db.execute(
      `SELECT m.name, m.id, SUM(oi.quantity) as total_sold
       FROM order_items oi JOIN meals m ON oi.meal_id = m.id
       JOIN orders o ON oi.order_id = o.id
       WHERE o.status != 'cancelled' AND o.created_at >= SYSDATE - NVL(:period, 30)
       GROUP BY m.name, m.id ORDER BY total_sold DESC FETCH FIRST 5 ROWS ONLY`
    , [parseInt(period) || 30]);

    // Revenus par catégorie
    const categoryStatsResult = await db.execute(
      `SELECT c.name, SUM(oi.total_price) as revenue
       FROM order_items oi JOIN meals m ON oi.meal_id = m.id
       JOIN categories c ON m.category_id = c.id
       JOIN orders o ON oi.order_id = o.id
       WHERE o.status != 'cancelled' AND o.created_at >= SYSDATE - NVL(:period, 30)
       GROUP BY c.name ORDER BY revenue DESC`
    , [parseInt(period) || 30]);

    // Nombre de tables occupées vs total
    const activeTablesResult = await db.execute(
      `SELECT COUNT(CASE WHEN status = 'occupied' THEN 1 END) as occupied, COUNT(*) as total FROM tables`
    );

    // 10 dernières commandes
    const recentOrdersResult = await db.execute(
      `SELECT o.id, o.total, o.order_type, o.status, o.created_at, t.table_number
       FROM orders o LEFT JOIN tables t ON o.table_id = t.id
       WHERE ROWNUM <= 10 ORDER BY o.created_at DESC`
    );

    // Statistiques des avis (total et note moyenne)
    const reviewStatsResult = await db.execute(
      `SELECT COUNT(*) as total_reviews, AVG(rating) as avg_rating
       FROM reviews WHERE status = 'visible'`
    );

    res.status(200).json({
      success: true,
      data: {
        revenue: revenueResult.rows[0],
        popularMeals: popularMealsResult.rows,
        categoryStats: categoryStatsResult.rows,
        activeTables: activeTablesResult.rows[0],
        recentOrders: recentOrdersResult.rows,
        reviewStats: reviewStatsResult.rows[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats };
