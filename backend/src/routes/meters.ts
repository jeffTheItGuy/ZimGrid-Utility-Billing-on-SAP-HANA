import { Router } from 'express';
import { db } from '../config/database';

export const meterRouter = Router();

meterRouter.get('/readings', async (req, res) => {
  const { equipment_id, from, to, limit = '100' } = req.query;

  const result = await db.query(
    `SELECT * FROM meter_readings 
     WHERE equipment_id = $1 
     AND reading_date BETWEEN $2 AND $3
     ORDER BY reading_date DESC, reading_time DESC
     LIMIT $4`,
    [equipment_id, from, to, parseInt(limit as string)]
  );

  res.json(result.rows);
});

meterRouter.get('/:id/consumption-trend', async (req, res) => {
  const { id } = req.params;
  const result = await db.query(
    `SELECT DATE_TRUNC('month', reading_date) as month,
            SUM(consumption_kwh) as total_kwh,
            COUNT(*) as reading_count
     FROM meter_readings
     WHERE equipment_id = $1
     AND reading_date >= CURRENT_DATE - INTERVAL '12 months'
     GROUP BY DATE_TRUNC('month', reading_date)
     ORDER BY month`,
    [id]
  );
  res.json(result.rows);
});
