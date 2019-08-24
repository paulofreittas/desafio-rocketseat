import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class SendMail {
  get key() {
    return 'SendMail';
  }

  async handle({ data }) {
    const { subscription } = data;

    await Mail.sendMail({
      to: `${subscription.Meetup.User.name} <${subscription.Meetup.User.email}>`,
      subject: 'Um novo inscrito no seu Meetup',
      template: 'meetupSubscribe',
      context: {
        meetupCreator: subscription.Meetup.User.name,
        userName: subscription.User.name,
        userEmail: subscription.User.email,
        title: subscription.Meetup.title,
        date: format(
          parseISO(subscription.Meetup.date),
          "'dia' dd 'de' MMMM', às' H:mm'h'",
          {
            locale: pt,
          }
        ),
        location: subscription.Meetup.location,
      },
    });
  }
}

export default new SendMail();
