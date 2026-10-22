

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

const destinations = [
  {
    title: "Make the city yours",
    description: "Find your own route.",
    image: "/images/harar.jpg",
  },
  {
    title: "Take the scenic route",
    description: "Get away from the everyday.",
    image: "/images/froad.jpg",
  },
  {
    title: "A different kind of getaway",
    description: "Find somewhere new.",
    image: "../images/getaway.jpg",
  },
];

const benefits = [
  {
    icon: "♡",
    title: "People come first",
    description:
      "Connect with local car owners who care about your journey.",
  },
  {
    icon: "✳",
    title: "Clear expectations",
    description:
      "Review the price, vehicle details, and booking information.",
  },
  {
    icon: "✓",
    title: "Your trip, your way",
    description:
      "Keep your booking details together from request to return.",
  },
];

const testimonials = [
  {
    name: "Mr. T.",
    role: "Weekend traveller",
    quote:
      "Finding the right car was simple. The whole experience felt personal and stress-free.",
  },
  {
    name: "Mrs. K.",
    role: "Local renter",
    quote:
      "The owner was helpful, the car was clean, and pickup was straightforward.",
  },
  {
    name: "Mr. M.",
    role: "Family traveller",
    quote:
      "It made planning our family trip easier. Everything was clear from the beginning.",
  },
];

const faqs = [
  {
    question: "How does renting a car work?",
    answer:
      "Browse available cars, select the dates you need, and submit a booking request. Review the booking details before your trip.",
  },
  {
    question: "Can I list my own car?",
    answer:
      "Yes. Create an owner account, add your vehicle details, set your daily price, and manage your booking requests.",
  },
  {
    question: "How much does it cost to rent a car?",
    answer:
      "The daily rental price depends on the vehicle. Review the listing and total booking price before confirming.",
  },
  {
    question: "Can I manage my bookings online?",
    answer:
      "Yes. Your renter dashboard will let you review upcoming and previous bookings and access eligible booking actions.",
  },
  {
    question: "Is online payment available?",
    answer:
      "The initial project can use a mock checkout experience. Real payments can be integrated separately later.",
  },
];

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        {/* Hero section */}
        <section className="hero container">
          <div className="hero-copy">
            <span className="eyebrow">
              A BETTER WAY TO GET THERE
            </span>

            <h1>
              Good cars.
              <br />
              Local people.
              <br />
              <span>Your next move.</span>
            </h1>

            <p>
              Find a car that fits your plans, from people who know
              the place. Your next great journey starts here.
            </p>

            <div className="hero-trust">
              <span className="trust-symbol">✓</span>
              <div>
                <strong>Local hosts. Real freedom.</strong>
                <small>
                  Discover your next favourite drive.
                </small>
              </div>
            </div>
          </div>

          <div
            className="hero-visual"
            role="img"
            aria-label="A car ready for a scenic road trip"
          >
            <div className="hero-image-caption">
              <span className="online-dot" />
              Your next adventure starts here
            </div>
          </div>

          <form className="search-bar" action="/cars">
            <label className="search-field">
              <span className="field-icon">⌖</span>
              <span className="field-content">
                <span className="field-label">LOCATION</span>
                <input
                  type="text"
                  name="location"
                  placeholder="Where are you going?"
                />
              </span>
            </label>

            <label className="search-field">
              <span className="field-icon">▦</span>
              <span className="field-content">
                <span className="field-label">PICK-UP</span>
                <input
                  type="date"
                  name="pickup"
                  aria-label="Pick-up date"
                />
              </span>
            </label>

            <label className="search-field">
              <span className="field-icon">▦</span>
              <span className="field-content">
                <span className="field-label">RETURN</span>
                <input
                  type="date"
                  name="return"
                  aria-label="Return date"
                />
              </span>
            </label>

            <button className="button button-primary" type="submit">
              Find a car <span>↗</span>
            </button>
          </form>
        </section>

        {/* Stats section */}
        <section className="stats-section">
          <div className="container stats-grid">
            <div>
              <strong>Local</strong>
              <span>People, not big agencies</span>
            </div>
            <div>
              <strong>120+</strong>
              <span>Ways to get moving</span>
            </div>
            <div>
              <strong>12</strong>
              <span>Neighbourhoods to explore</span>
            </div>
            <div>
              <strong>4.9/5</strong>
              <span>Community-rated experience</span>
            </div>
          </div>
        </section>

        {/* Destinations section */}
        <section className="section container">
          <div className="section-heading">
            <span className="eyebrow">GO A LITTLE FURTHER</span>
            <h2>Different plans. One great city.</h2>
            <p>
              A quick errand or a long way round. There is a car for that.
            </p>
          </div>

          <div className="destinations-grid">
            {destinations.map((destination) => (
              <a
                href="/cars"
                className="destination-card"
                key={destination.title}
              >
                <div
                  className="destination-image"
                  style={{
                    backgroundImage: `url("${destination.image}")`,
                  }}
                />
                <h3>
                  {destination.title} <span>↗</span>
                </h3>
                <p>{destination.description}</p>
              </a>
            ))}
          </div>
        </section>

        {/* Trust section */}
        <section className="trust-section">
          <div className="container">
            <span className="eyebrow eyebrow-light">
              GOOD JOURNEYS START WITH TRUST
            </span>
            <h2>Good journeys start with trust.</h2>
            <p className="trust-intro">
              A little peace of mind goes a long way. We make it easier
              to book with confidence.
            </p>

            <div className="benefits-grid">
              {benefits.map((benefit) => (
                <article
                  className="benefit-card"
                  key={benefit.title}
                >
                  <span className="benefit-icon">
                    {benefit.icon}
                  </span>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="section container">
          <div className="section-heading">
            <span className="eyebrow">KIND WORDS, REAL TRIPS</span>
            <h2>A few words from the driver's seat.</h2>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((item) => (
              <article
                className="testimonial-card"
                key={item.name}
              >
                <div
                  className="testimonial-stars"
                  aria-label="5 out of 5 stars"
                >
                  ★★★★★
                  <span>Community story</span>
                </div>

                <p>“{item.quote}”</p>

                <div className="testimonial-person">
                  <span className="person-avatar">
                    {item.name.charAt(0)}
                  </span>
                  <div>
                    <strong>{item.name}</strong>
                    <small>{item.role}</small>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Car owner promotion */}
        <section className="owner-promo container">
          <div
            className="owner-promo-image"
            role="img"
            aria-label="Car owner beside a vehicle"
          />

          <div className="owner-promo-copy">
            <span className="eyebrow">YOUR CAR, YOUR TERMS</span>
            <h2>
              Park less.
              <br />
              Earn on your terms.
            </h2>
            <p>
              Put your car to work when you are not using it.
              Earn extra income and stay in control of your calendar.
            </p>
            <a
              className="button button-primary"
              href="/signup?role=owner"
            >
              Become a host <span>↗</span>
            </a>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="section container faq-section">
          <div className="faq-intro">
            <span className="eyebrow">GOOD TO KNOW</span>
            <h2>
              Before you hit
              <br />
              the road.
            </h2>
            <p>
              A few helpful things to know before your first trip.
            </p>
            <a href="/cars" className="text-link">
              Ready to explore? ↗
            </a>
          </div>

          <div className="faq-list">
            {faqs.map((faq) => (
              <details key={faq.question}>
                <summary>
                  {faq.question}
                  <span>+</span>
                </summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="final-cta">
          <div className="container final-cta-inner">
            <div>
              <h2>Where will your next set of keys take you?</h2>
              <p>
                Make room for a new route and a little more freedom.
              </p>
            </div>
            <a className="button button-primary" href="/cars">
              Find your next car <span>↗</span>
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
