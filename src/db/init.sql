-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO tasks (title, description) VALUES
    ('Welcome to Task Manager', 'This is a sample task to get you started. Feel free to add more tasks!'),
    ('Learn GitOps', 'Study GitOps principles and practices for better deployment workflows'),
    ('Setup Development Environment', 'Configure your local development environment with DevSpace')
ON CONFLICT DO NOTHING; 