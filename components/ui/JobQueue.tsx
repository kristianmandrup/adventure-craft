import React from 'react';
import { Loader2, CheckCircle } from 'lucide-react';
import { Job } from '../../types';

interface JobQueueProps {
  jobs: Job[];
}

export const JobQueue: React.FC<JobQueueProps> = ({ jobs }) => {
  return (
    <div className="absolute top-32 left-6 flex flex-col gap-2 pointer-events-none">
      {jobs.map((job) => (
        <div key={job.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg backdrop-blur-md border ${job.status === 'success' ? 'bg-green-600/80 border-green-400' : 'bg-black/70 border-white/10'} text-white`}>
          {job.status === 'generating' ? <Loader2 className="animate-spin w-4 h-4"/> : job.status === 'success' ? <CheckCircle className="w-4 h-4"/> : <div className="w-4 h-4 rounded-full border-2"/>}
          <span className="text-sm font-semibold">{job.prompt}</span>
        </div>
      ))}
    </div>
  );
};