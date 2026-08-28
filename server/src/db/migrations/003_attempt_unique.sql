DELETE FROM attempts
WHERE id NOT IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY student_id, assignment_id
      ORDER BY completed_at DESC, started_at DESC
    ) AS rn
    FROM attempts
  )
  WHERE rn = 1
);

CREATE UNIQUE INDEX idx_attempts_student_assignment ON attempts(student_id, assignment_id);
