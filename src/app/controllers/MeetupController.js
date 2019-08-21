import * as Yup from 'yup';
import { Op } from 'sequelize';
import {
  parseISO,
  isBefore,
  startOfHour,
  startOfDay,
  endOfDay,
} from 'date-fns';
import Meetup from '../models/Meetup';
import User from '../models/User';

class MeetupController {
  async index(req, res) {
    const where = {};
    const page = req.query.page || 1;

    if (req.query.date) {
      const searchDate = parseISO(req.query.date);

      where.date = {
        [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
      };
    }

    const meetups = await Meetup.findAll({
      where,
      include: [User],
      limit: 10,
      offset: 10 * page - 10,
    });

    return res.json(meetups);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
      file_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const meetup = req.body;

    const hourStart = startOfHour(parseISO(meetup.date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'The date informed has passed' });
    }

    meetup.user_id = req.userId;
    meetup.date = hourStart;

    const { title, description, location, date } = await Meetup.create(meetup);

    return res.status(201).json({
      title,
      description,
      location,
      date,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
      file_id: Yup.number().required(),
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const meetup = req.body;

    const hourStart = startOfHour(parseISO(meetup.date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'The date informed has passed' });
    }

    const meetupExisting = await Meetup.findByPk(meetup.id);

    if (!meetupExisting) {
      return res.status(400).json({ error: 'Meetup not exists' });
    }

    if (meetupExisting.user_id !== req.userId) {
      return res
        .status(400)
        .json({ error: 'Only the creator of meetup can edit it' });
    }

    if (meetupExisting.past) {
      return res.status(400).json({ error: 'Meetup has already happened' });
    }

    meetup.date = hourStart;
    meetup.user_id = req.userId;

    const { title, description, location, date } = await meetupExisting.update(
      meetup
    );

    return res.status(200).json({
      title,
      description,
      location,
      date,
    });
  }

  async delete(req, res) {
    const meetup = await Meetup.findByPk(req.params.id);

    if (!meetup) {
      return res.status(400).json({ error: 'Meetup not found' });
    }

    if (meetup.user_id !== req.userId) {
      return res
        .status(401)
        .json({ error: 'Only the creator of meetup can edit it' });
    }

    if (meetup.past) {
      return res.status(400).json({ error: 'Meetup has already happened' });
    }

    await meetup.destroy();

    return res.send();
  }
}

export default new MeetupController();
