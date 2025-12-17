-- Enable realtime for imports table
ALTER TABLE imports REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE imports;