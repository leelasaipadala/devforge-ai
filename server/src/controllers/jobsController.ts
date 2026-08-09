import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { JobApplication } from '../models/JobApplication.js';
import { Activity } from '../models/Activity.js';
import { isMongoConnected } from '../config/db.js';

const memoryJobs = new Map<string, any[]>();

export const getJobApplications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    let jobs: any[] = [];

    if (isMongoConnected) {
      jobs = await JobApplication.find({ userId }).sort({ updatedAt: -1 });
    } else {
      jobs = memoryJobs.get(userId) || [];
    }

    res.json({ success: true, jobs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error fetching job applications' });
  }
};

export const createJobApplication = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const {
      company,
      position,
      location,
      workMode,
      jobType,
      jobUrl,
      appliedDate,
      deadline,
      status,
      priority,
      notes,
      recruiterName,
      recruiterEmail,
      nextAction,
      nextActionDate,
      salaryRange,
      description,
      skills,
    } = req.body;

    if (!company || !position) {
      res.status(400).json({ success: false, message: 'Company and Position (Job Title) are required' });
      return;
    }

    const initialStatus = status || 'Applied';

    const jobData = {
      userId,
      company,
      position,
      location: location || 'Remote',
      workMode: workMode || 'Remote',
      jobType: jobType || 'Full Time',
      jobUrl: jobUrl || '',
      appliedDate: appliedDate ? new Date(appliedDate) : new Date(),
      deadline: deadline ? new Date(deadline) : undefined,
      status: initialStatus,
      priority: priority || 'Medium',
      notes: notes || '',
      recruiterName: recruiterName || '',
      recruiterEmail: recruiterEmail || '',
      nextAction: nextAction || '',
      nextActionDate: nextActionDate ? new Date(nextActionDate) : undefined,
      salaryRange: salaryRange || '',
      description: description || '',
      skills: Array.isArray(skills) ? skills : [],
      timeline: [
        {
          status: initialStatus,
          title: `Application ${initialStatus}`,
          date: new Date(),
          notes: `Added application for ${position} at ${company}`,
        },
      ],
    };

    let job: any = null;

    if (isMongoConnected) {
      job = await JobApplication.create(jobData);
      await Activity.create({
        userId,
        type: 'job',
        title: `Added Job Application (${company})`,
        description: `Position: ${position} - Status: ${initialStatus}`,
      });
    } else {
      job = { ...jobData, _id: `job-${Date.now()}` };
      const existing = memoryJobs.get(userId) || [];
      existing.unshift(job);
      memoryJobs.set(userId, existing);
    }

    res.status(201).json({ success: true, job });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error creating job application' });
  }
};

export const updateJobApplication = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const updates = { ...req.body };

    let job: any = null;

    if (isMongoConnected) {
      const existingJob = await JobApplication.findOne({ _id: id, userId });
      if (!existingJob) {
        res.status(404).json({ success: false, message: 'Job application not found' });
        return;
      }

      if (updates.status && updates.status !== existingJob.status) {
        const timelineItem = {
          status: updates.status,
          title: `Status changed to ${updates.status}`,
          date: new Date(),
          notes: updates.notes || `Moved application stage to ${updates.status}`,
        };
        updates.$push = { timeline: timelineItem };
      }

      job = await JobApplication.findOneAndUpdate({ _id: id, userId }, updates, { new: true });
    } else {
      const existing = memoryJobs.get(userId) || [];
      const idx = existing.findIndex((j) => j._id === id);
      if (idx !== -1) {
        if (updates.status && updates.status !== existing[idx].status) {
          const timeline = existing[idx].timeline || [];
          timeline.push({
            status: updates.status,
            title: `Status changed to ${updates.status}`,
            date: new Date(),
          });
          updates.timeline = timeline;
        }
        existing[idx] = { ...existing[idx], ...updates };
        job = existing[idx];
        memoryJobs.set(userId, existing);
      }
    }

    if (!job) {
      res.status(404).json({ success: false, message: 'Job application not found' });
      return;
    }

    res.json({ success: true, job });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error updating job application' });
  }
};

export const deleteJobApplication = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    if (isMongoConnected) {
      await JobApplication.findOneAndDelete({ _id: id, userId });
    } else {
      const existing = memoryJobs.get(userId) || [];
      const filtered = existing.filter((j) => j._id !== id);
      memoryJobs.set(userId, filtered);
    }

    res.json({ success: true, message: 'Job application deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error deleting job application' });
  }
};
