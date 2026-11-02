const express = require("express");
const router = express.Router();

const Feedback = require("../models/Feedback");

// SUBTASK 1: POST FEEDBACK

router.post("/", async (req, res) => {

    try {

        const { studentName, courseName, message, rating } = req.body;

        if (!studentName || !courseName || !message || rating === undefined) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (rating < 1 || rating > 5 || !Number.isInteger(Number(rating))) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5"
            });
        }

        const feedback = new Feedback({
            studentName,
            courseName,
            message,
            rating
        });

        await feedback.save();

        res.status(201).json({
            message: "Feedback submitted successfully",
            feedback
        });

    }
    catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

});

// SUBTASK 2: GET FEEDBACK WITH PAGINATION

router.get("/", async (req, res) => {

    try {

        const page = parseInt(req.query.page) || 1;

        const limit = parseInt(req.query.limit) || 5;

        const skip = (page - 1) * limit;

        const feedbacks = await Feedback.find()
            .skip(skip)
            .limit(limit);

        const totalFeedback = await Feedback.countDocuments();

        res.status(200).json({

            currentPage: page,

            totalFeedback: totalFeedback,

            totalPages: Math.ceil(totalFeedback / limit),

            feedbacks: feedbacks

        });

    }
    catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

});



// SUBTASK 3: UPDATE FEEDBACK STATUS

router.patch("/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const { status } = req.body;

        if (!["Pending", "Reviewed"].includes(status)) {
            return res.status(400).json({
                message: "Status must be Pending or Reviewed"
            });
        }

        const feedback = await Feedback.findByIdAndUpdate(
            id,
            { status: status },
            { new: true, runValidators: true }
        );

        if (!feedback) {
            return res.status(404).json({
                message: "Feedback not found"
            });
        }

        res.status(200).json({
            message: "Feedback status updated successfully",
            feedback
        });

    }
    catch (err) {

        if (err.name === "CastError") {
            return res.status(400).json({
                message: "Invalid Feedback ID"
            });
        }

        res.status(500).json({
            message: err.message
        });

    }

});





module.exports = router;