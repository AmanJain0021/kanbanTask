import Board from '../models/Board.js';
import User from '../models/User.js';

export const createBoard = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    const board = await Board.create({
      title,
      description,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'owner' }],
    });

    res.status(201).json({
      success: true,
      data: board,
    });
  } catch (error) {
    next(error);
  }
};

export const getBoards = async (req, res, next) => {
  try {
    const boards = await Board.find({
      'members.user': req.user._id,
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: boards,
    });
  } catch (error) {
    next(error);
  }
};

export const getBoardById = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found' });
    }

    // Verify membership
    const isMember = board.members.some(
      (m) => m.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this board' });
    }

    res.json({
      success: true,
      data: board,
    });
  } catch (error) {
    next(error);
  }
};

export const inviteMember = async (req, res, next) => {
  try {
    const { email } = req.body;
    const boardId = req.params.id;

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found' });
    }

    // Only owner can invite
    if (board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the board owner can invite new members',
      });
    }

    const invitee = await User.findOne({ email });
    if (!invitee) {
      return res.status(404).json({
        success: false,
        message: 'User with this email not found. They must register first.',
      });
    }

    // Check if already a member
    const alreadyMember = board.members.some(
      (m) => m.user.toString() === invitee._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this board',
      });
    }

    board.members.push({ user: invitee._id, role: 'member' });
    await board.save();

    const updatedBoard = await Board.findById(boardId)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.json({
      success: true,
      message: 'Member invited successfully',
      data: updatedBoard,
    });
  } catch (error) {
    next(error);
  }
};
