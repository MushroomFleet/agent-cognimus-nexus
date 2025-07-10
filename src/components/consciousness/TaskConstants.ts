import { Clock, Users, CheckCircle, XCircle } from 'lucide-react';
import { Task } from '@/types/task';

export const STATUS_ICONS = {
  pending: Clock,
  in_progress: Users,
  completed: CheckCircle,
  failed: XCircle
};

export const STATUS_COLORS = {
  pending: 'bg-yellow-500',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
  failed: 'bg-red-500'
};