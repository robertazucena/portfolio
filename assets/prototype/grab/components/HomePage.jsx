import Navbar from "./Navbar";
import WelcomeBanner from "./WelcomeBanner";
import TodoPanel from "./TodoPanel";
import NewsroomCarousel from "./NewsroomCarousel";
import ToolsSection from "./ToolsSection";
import Footer from "./Footer";
import "./tokens.css";
import "./base.css";

/**
 * HomePage — composes the six shared components into the portal's
 * Home screen. Every prop below is sample content matching the
 * approved design; swap in real data from your API/CMS as-is, the
 * component contracts won't need to change.
 */
export default function HomePage() {
  return (
    <div>
      <Navbar
        items={[
          { label: "What's new", active: true, hasChildren: true },
          { label: "Locations", hasChildren: true },
          { label: "For employees", hasChildren: true },
          { label: "Human resources", hasChildren: true },
        ]}
        user={{ name: "Alexander Yuan", notifications: 5, avatarUrl: "/avatars/alexander-yuan.jpg" }}
        showMenuButton
      />

      <main className="gp-shell">
        <div className="gp-toprow">
          <WelcomeBanner
            name="Alexander"
            hero={{
              eyebrow: "Our Grab Heroes Portal",
              title: "Empowering every employee to excel",
              imageUrl: "./assets/hero/team-huddle.jpg",
            }}
          />
          <TodoPanel
            items={[
              { tone: "reminder", tag: "Reminder", text: "Update your contact details and your marital status in the employee portal." },
              { tone: "alert", tag: "Action required", text: "Complete your mandatory cybersecurity training." },
              { tone: "reminder", tag: "Reminder", text: "Upload missing documents for benefits enrollment." },
              { tone: "reminder", tag: "Reminder", text: "Read the latest terms and conditions and make sure that you agree/disagree." },
            ]}
          />
        </div>

        <NewsroomCarousel
          activeSlide={0}
          slideCount={3}
          featured={{
            posted: "1 day ago",
            title: "Grab Reports Third Quarter 2024 Results",
            imageUrl: "./assets/newsroom/q3-2024-earnings.jpg",
          }}
          stories={[
            { posted: "54 minutes ago", title: "Loqate partners with GrabMaps to enhance location data capabilities in Southeast Asia", imageUrl: "./assets/newsroom/grabmaps-loqate.jpg" },
            { posted: "3 days ago", title: "Grab Commits S$4 21 Million Yearly to Upgraded GrabBenefits 2.0 Partner Welfare Programme in Singapore", imageUrl: "./assets/newsroom/grabbenefits-2.jpg" },
            { posted: "4 days ago", title: "Grab PH Opens Doors for Future Business, STEM, Sustainability Leaders", imageUrl: "./assets/newsroom/grab-ph-stem.jpg" },
          ]}
        />
      </main>

      <ToolsSection
        intro="Tools, resources and tasks -- everything you need to power through your day, all in one place."
        imageUrl="./assets/team/whiteboard-session.jpg"
        capabilities={[
          { icon: "personal", title: "Personal Information", desc: "See your personal details, contact info, compensation and more." },
          { icon: "connections", title: "Connections", desc: "Check out the employee directory here." },
          { icon: "journeys", title: "Journeys", desc: "Request a workspace category change." },
          { icon: "time", title: "Time and Absence", desc: "Request, extend or cancel a personal leave of absence." },
          { icon: "career", title: "Career and Performance", desc: "Keep track of your career development here." },
        ]}
      />

      <Footer />
    </div>
  );
}
