import React, { Component } from 'react';
import { Link } from 'react-router';
import { CounterButton, ListingCard } from 'components';
import config from '../../config';
import Helmet from 'react-helmet';

export default class Home extends Component {
  render() {
    const dummyDate = Date.now();
    const dummyListings = [
      {
        keyId: 0,
        creationDate: dummyDate,
        lastModificationDate: dummyDate,
        title: 'Chair',
        description: 'Donec non congue ante. Sed blandit, velit sed imperdiet venenatis, odio lorem venenatis risus, nec egestas odio ligula non dolor. Quisque at est nibh. Morbi suscipit elementum diam, non egestas felis porttitor consectetur. Aenean cursus sed metus eu cursus. Phasellus suscipit orci sem, a volutpat turpis vulputate vitae.',
        userId: 0,
        price: 500,
        status: 'for sale',
        expirationDate: dummyDate + 100000,
        thumbnail: 'https://i.imgur.com/74TZlp9.png'
      },
      {
        keyId: 1,
        creationDate: dummyDate,
        lastModificationDate: dummyDate,
        title: 'Did you ever hear the tragedy of Darth Plagueis the Wise?',
        description: 'I thought not. It’s not a story the Jedi would tell you. It’s a Sith legend. Darth Plagueis was a Dark Lord of the Sith, so powerful and so wise he could use the Force to influence the midichlorians to create life… He had such a knowledge of the dark side that he could even keep the ones he cared about from dying. The dark side of the Force is a pathway to many abilities some consider to be unnatural. He became so powerful… the only thing he was afraid of was losing his power, which eventually, of course, he did. Unfortunately, he taught his apprentice everything he knew, then his apprentice killed him in his sleep. Ironic. He could save others from death, but not himself.',
        userId: 1,
        price: 500,
        status: 'for sale',
        expirationDate: dummyDate + 100000,
        thumbnail: 'https://i.imgur.com/sSyxLmI.png'
      },
    ];

    const styles = require('./Home.scss');
    // require the logo image both from client and server
    // const logoImage = require('./logo.png');
    return (
      <div className={styles.home}>
        <Helmet title="Home"/>
        <div className="container">
          <h1>{config.app.title}</h1>
          <h2>{config.app.description} {dummyListings.length}</h2>
          <div className={styles.counterContainer}>
            <CounterButton multireducerKey="counter1"/>
            <CounterButton multireducerKey="counter2"/>
            <CounterButton multireducerKey="counter3"/>
          </div>

          <ListingCard listing={dummyListings[0]}/>

          <h3>Features demonstrated in this project</h3>

          <dl>
            <dt>Server-side data loading</dt>
            <dd>
              The <Link to="/widgets">Widgets page</Link> demonstrates how to fetch data asynchronously from
              some source that is needed to complete the server-side rendering. <code>Widgets.js</code>'s
              <code>asyncConnect()</code> function is called before the widgets page is loaded, on either the server
              or the client, allowing all the widget data to be loaded and ready for the page to render.
            </dd>
            <dt>Data loading errors</dt>
            <dd>
              The <Link to="/widgets">Widgets page</Link> also demonstrates how to deal with data loading
              errors in Redux. The API endpoint that delivers the widget data intentionally fails 33% of
              the time to highlight this. The <code>clientMiddleware</code> sends an error action which
              the <code>widgets</code> reducer picks up and saves to the Redux state for presenting to the user.
            </dd>
            <dt>Session based login</dt>
            <dd>
              On the <Link to="/login">Login page</Link> you can submit a username which will be sent to the server
              and stored in the session. Subsequent refreshes will show that you are still logged in.
            </dd>
            <dt>Redirect after state change</dt>
            <dd>
              After you log in, you will be redirected to a Login Success page. This <strike>magic</strike> logic
              is performed in <code>componentWillReceiveProps()</code> in <code>App.js</code>, but it could
              be done in any component that listens to the appropriate store slice, via Redux's <code>@connect</code>,
              and pulls the router from the context.
            </dd>
            <dt>Auth-required views</dt>
            <dd>
              The aforementioned Login Success page is only visible to you if you are logged in. If you try
              to <Link to="/loginSuccess">go there</Link> when you are not logged in, you will be forwarded back
              to this home page. This <strike>magic</strike> logic is performed by the
              <code>onEnter</code> hook within <code>routes.js</code>.
            </dd>
            <dt>Forms</dt>
            <dd>
              The <Link to="/survey">Survey page</Link> uses the
              still-experimental <a href="https://github.com/erikras/redux-form" target="_blank">redux-form</a> to
              manage form state inside the Redux store. This includes immediate client-side validation.
            </dd>
            <dt>Pagination</dt>
            <dd>
              The <Link to="/pagination">Pagination page</Link> uses
              <a href="https://www.npmjs.com/package/violet-paginator" target="_blank">violet-paginator</a> to
              paginate and sort records in a data table.
            </dd>
            <dt>WebSockets / socket.io</dt>
            <dd>
              The <Link to="/chat">Chat</Link> uses the socket.io technology for real-time
              communication between clients. You need to <Link to="/login">login</Link> first.
            </dd>
          </dl>

          <h3>From the author</h3>

          <p>
            I cobbled this together from a wide variety of similar "starter" repositories. As I post this in June 2015,
            all of these libraries are right at the bleeding edge of web development. They may fall out of fashion as
            quickly as they have come into it, but I personally believe that this stack is the future of web development
            and will survive for several years. I'm building my new projects like this, and I recommend that you do,
            too.
          </p>

          <p>Thanks for taking the time to check this out.</p>

          <p>– Erik Rasmussen</p>
        </div>
      </div>
    );
  }
}
