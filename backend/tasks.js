

const express = require('express');
const pool = require('./db');
const isAuthenticated = require('./authMiddleware');

const router = express.Router();
const { createTaskSchema, updateTaskSchema } = require('./validators');
// Create a new task



router.post('/', isAuthenticated, async (req, res) => {
  try {
    
const { error, value } = createTaskSchema.validate(req.body, {
  abortEarly: false,
  convert: true,
});

if (error) {
  return res.status(400).json({
    message: 'Validation failed.',
    errors: error.details.map((detail) => detail.message),
  });
}

    const {
      title,
      description,
      team_id,
      assigned_to,
      due_date,
    } = value;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: 'Task title is required.',
      });
    }

    const teamId = Number(team_id);

    if (!Number.isInteger(teamId) || teamId < 1) {
      return res.status(400).json({
        message: 'A valid team ID is required.',
      });
    }

    // Check that the logged-in user belongs to this team
    const teamResult = await pool.query(
      `SELECT team_id
       FROM team_members
       WHERE team_id = $1 AND user_id = $2`,
      [teamId, req.user.id]
    );

    if (teamResult.rows.length === 0) {
      return res.status(403).json({
        message: 'You are not a member of this team.',
      });
    }

    if (assigned_to != null) {
  const assignedUserResult = await pool.query(
    `SELECT 1
     FROM team_members
     WHERE team_id = $1 AND user_id = $2`,
    [teamId, assigned_to]
  );

  if (assignedUserResult.rows.length === 0) {
    return res.status(400).json({
      message: 'Assigned user must be a member of this team.',
    });
  }
}
    
    const result = await pool.query(
      `INSERT INTO tasks
        (title, description, team_id, assigned_to, due_date, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        title.trim(),
        description?.trim() || null,
        teamId,
        assigned_to || null,
        due_date || null,
        req.user.id,
      ]
    );

    res.status(201).json({
      message: 'Task created successfully.',
      task: result.rows[0],
    });
  } catch (error) {
    console.error('Create task error:', error.message);

    res.status(500).json({
      message: 'Something went wrong while creating the task.',
    });
  }
});

// Get tasks for teams the logged-in user belongs to
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         tasks.*,
         teams.name AS team_name,
         users.name AS assigned_user_name
       FROM tasks
       JOIN team_members
         ON tasks.team_id = team_members.team_id
       JOIN teams
         ON tasks.team_id = teams.id
       LEFT JOIN users
         ON tasks.assigned_to = users.id
       WHERE team_members.user_id = $1
       ORDER BY tasks.created_at DESC`,
      [req.user.id]
    );

    res.json({
      message: 'Tasks fetched successfully.',
      tasks: result.rows,
    });
  } catch (error) {
    console.error('Get tasks error:', error.message);

    res.status(500).json({
      message: 'Something went wrong while fetching tasks.',
    });
  }
});



/* Update an existing task */

router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const { error, value } = updateTaskSchema.validate(req.body, {
      abortEarly: false,
      convert: true,
    });

    if (error) {
      return res.status(400).json({
        message: 'Validation failed.',
        errors: error.details.map((detail) => detail.message),
      });
    }

    const taskId = Number(req.params.id);


    if (!Number.isInteger(taskId) || taskId < 1) {
      return res.status(400).json({
        message: 'A valid task ID is required.',
      });
    }

    const {
  title,
  description,
  status,
  assigned_to,
  due_date,
} = value;


    // Check that the user belongs to the task's team
    const accessResult = await pool.query(
      `SELECT tasks.id
       FROM tasks
       JOIN team_members
         ON tasks.team_id = team_members.team_id
       WHERE tasks.id = $1
         AND team_members.user_id = $2`,
      [taskId, req.user.id]
    );

    if (accessResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Task not found or you do not have access.',
      });
    }


    const taskTeamResult = await pool.query(
  'SELECT team_id FROM tasks WHERE id = $1',
  [taskId]
);

const taskTeamId = taskTeamResult.rows[0].team_id;

if (assigned_to !== undefined && assigned_to !== null) {
  const assignedUserResult = await pool.query(
    `SELECT 1
     FROM team_members
     WHERE team_id = $1 AND user_id = $2`,
    [taskTeamId, assigned_to]
  );

  if (assignedUserResult.rows.length === 0) {
    return res.status(400).json({
      message: 'Assigned user must be a member of this team.',
    });
  }
}

    const result = await pool.query(
  `UPDATE tasks
   SET
     title = COALESCE($1, title),
     description = CASE
       WHEN $2::boolean THEN $3
       ELSE description
     END,
     status = COALESCE($4, status),
     assigned_to = CASE
       WHEN $5::boolean THEN $6::integer
       ELSE assigned_to
     END,
     due_date = CASE
       WHEN $7::boolean THEN $8::timestamp
       ELSE due_date
     END,
     updated_at = CURRENT_TIMESTAMP
   WHERE id = $9
   RETURNING *`,
  [
    title === undefined ? null : title.trim(),
    description !== undefined,
    description === undefined ? null : description,
    status === undefined ? null : status,
    assigned_to !== undefined,
    assigned_to === undefined ? null : assigned_to,
    due_date !== undefined,
    due_date === undefined ? null : due_date,
    taskId,
  ]
);

    res.json({
      message: 'Task updated successfully.',
      task: result.rows[0],
    });
  } catch (error) {
    console.error('Update task error:', error.message);

    res.status(500).json({
      message: 'Something went wrong while updating the task.',
    });
  }
});


/* Delete a task */
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const taskId = Number(req.params.id);

    if (!Number.isInteger(taskId) || taskId < 1) {
      return res.status(400).json({
        message: 'A valid task ID is required.',
      });
    }

    // Check that the user belongs to the task's team
    const accessResult = await pool.query(
      `SELECT tasks.id
       FROM tasks
       JOIN team_members
         ON tasks.team_id = team_members.team_id
       WHERE tasks.id = $1
         AND team_members.user_id = $2`,
      [taskId, req.user.id]
    );

    if (accessResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Task not found or you do not have access.',
      });
    }

    await pool.query(
      'DELETE FROM tasks WHERE id = $1',
      [taskId]
    );

    res.json({
      message: 'Task deleted successfully.',
    });
  } catch (error) {
    console.error('Delete task error:', error.message);

    res.status(500).json({
      message: 'Something went wrong while deleting the task.',
    });
  }
});


module.exports = router;
