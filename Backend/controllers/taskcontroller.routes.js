const { Task } = require("../models/task.model")
const { notifyTaskEvent } = require("../services/slackNotifier");

const getAllTasks = async (req, res) => {
   try {
       const tasks = await Task.find();
       res.json(tasks);
   } catch (error) {
       res.status(500).json({ error: 'Internal Server Error' });
   }
}
const createTask = async (req, res) => {
    const { title, description } = req.body;
    try {
        if (!title) {
            return res.status(400).json({ error: 'Title cannot be empty' });
        }
        const task = new Task({ title, description });
        await task.save();

        await notifyTaskEvent({ action: 'created', task });

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
const updateTask = async (req, res) => {
    const taskId = req.params.id;
    const { title, description, completed } = req.body;
    try {
        const task = await Task.findById(taskId);
        if (!task) { 
            return res.status(404).json({error: 'Task not found'});
        }

        if (title) {
            task.title = title;
        }
        if (description) {
            task.description = description;
        }
        if (completed !== undefined) {
            task.completed = completed;
        }
        await task.save();
        await notifyTaskEvent({ action: 'updated', task });
        res.json(task);
        
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
const deleteTask = async (req, res) => {
    const taskId = req.params.id;
    try {
        const tasks = await Task.findByIdAndDelete(taskId);
        if (!tasks) {
           return res.status(404).json({ error: 'Task not find'}) 
        }
        await notifyTaskEvent({ action: 'deleted', task: tasks });
        res.json({message:'Task deleted successfully'});
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
const markTaskAsCompleted = async (req, res) => {
    const taskId = req.params.id;
    try {
        const tasks = await Task.findById(taskId);
        if (!tasks) {
            return res.status(404).json({ msg: 'Task not found' });
        }

        if (tasks.completed) {
            return res.status(400).json({ msg: 'Task is already marked as completed' });
        }

        tasks.completed = true;
        await tasks.save();

        await notifyTaskEvent({ action: 'completed', task: tasks });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    getAllTasks,
    createTask,
    updateTask,
    deleteTask,
    markTaskAsCompleted,
    
};