
const express = require('express');
const pool = require('./db');
const isAuthenticated = require('./authMiddleware');

const router = express.Router();

// Create a new team
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: 'Team name is required.',
      });
    }

    const result = await pool.query(
      `INSERT INTO teams (name, description, created_by)
       VALUES ($1, $2, $3)
       RETURNING id, name, description, created_by, created_at`,
      [
        name.trim(),
        description?.trim() || null,
        req.user.id,
      ]
    );

    const team = result.rows[0];

    // Add the creator as a team owner
    await pool.query(
      `INSERT INTO team_members (team_id, user_id, role)
       VALUES ($1, $2, $3)`,
      [team.id, req.user.id, 'owner']
    );

    res.status(201).json({
      message: 'Team created successfully.',
      team,
    });
  } catch (error) {
    console.error('Create team error:', error.message);

    res.status(500).json({
      message: 'Something went wrong while creating the team.',
    });
  }
});


 // Get teams belonging to the logged-in user
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.id, t.name, t.description, t.created_by, t.created_at,
              tm.role
       FROM teams t
       JOIN team_members tm ON tm.team_id = t.id
       WHERE tm.user_id = $1
       ORDER BY t.created_at DESC`,
      [req.user.id]
    );

    res.json({
      teams: result.rows,
    });
  } catch (error) {
    console.error('Get teams error:', error.message);

    res.status(500).json({
      message: 'Something went wrong while fetching teams.',
    });
  }
});


 // Update a team
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const { name, description } = req.body;
    const teamId = Number(req.params.id);

    if (!Number.isInteger(teamId) || teamId < 1) {
      return res.status(400).json({
        message: 'Invalid team ID.',
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: 'Team name is required.',
      });
    }

    const result = await pool.query(
      `UPDATE teams t
       SET name = $1, description = $2
       WHERE t.id = $3
         AND t.created_by = $4
       RETURNING t.id, t.name, t.description, t.created_by, t.created_at`,
      [
        name.trim(),
        description?.trim() || null,
        teamId,
        req.user.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Team not found or you do not have permission to update it.',
      });
    }

    res.json({
      message: 'Team updated successfully.',
      team: result.rows[0],
    });
  } catch (error) {
    console.error('Update team error:', error.message);

    res.status(500).json({
      message: 'Something went wrong while updating the team.',
    });
  }
});



router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    console.log('DELETE request received for team:', req.params.id);
    const teamId = Number(req.params.id);

    if (!Number.isInteger(teamId) || teamId < 1) {
      return res.status(400).json({
        message: 'Invalid team ID.',
      });
    }

    const result = await pool.query(
      `DELETE FROM teams
       WHERE id = $1 AND created_by = $2
       RETURNING id, name`,
      [teamId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Team not found or you do not have permission to delete it.',
      });
    }

    res.json({
      message: 'Team deleted successfully.',
      team: result.rows[0],
    });
  } catch (error) {
    console.error('Delete team error:', error.message);

    res.status(500).json({
      message: 'Something went wrong while deleting the team.',
    });
  }
});


module.exports = router;
