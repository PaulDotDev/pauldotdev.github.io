(() => {
  "use strict";
  function track(eventName) {
    window.dataLayer?.push({
      event: "portfolio_interaction",
      portfolio_event: eventName,
    });
    window.dispatchEvent(
      new CustomEvent("portfolio:analytics", { detail: { event: eventName } }),
    );
  }
  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-analytics-event]");
    if (target) track(target.dataset.analyticsEvent);
  });
  // A missing local asset should explain the problem rather than stay loading.
  window.addEventListener(
    "error",
    (event) => {
      if (
        event.target?.tagName === "SCRIPT" &&
        event.target.src.includes("sculpture.bundle.js")
      ) {
        document.getElementById("renderStatus").textContent =
          "3D file missing — keep the assets folder beside index.html.";
        document.querySelectorAll(".scene-toolbar button").forEach((button) => {
          button.disabled = true;
        });
      }
    },
    true,
  );
  const nav = document.getElementById("nav");
  const progress = document.getElementById("progress");
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navlinks");
  function onScroll() {
    nav.classList.toggle("scrolled", scrollY > 45);
    const total = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (total > 0 ? (scrollY / total) * 100 : 0) + "%";
  }
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  function menu(open) {
    links.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation",
    );
  }
  toggle.addEventListener("click", () =>
    menu(!links.classList.contains("open")),
  );
  links
    .querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", () => menu(false)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && links.classList.contains("open")) {
      menu(false);
      toggle.focus();
    }
  });
  const projects = {
    phonon: {
      name: "Phonon Studio AI",
      category: "01 / GENERATIVE MUSIC",
      intro:
        "A generative AI music platform where slow processing created a visible product bottleneck.",
      role: "Software Engineer",
      contributions: [
        "Owned production services and cloud processing workflows across React/TypeScript interfaces, Node.js/Python services, PostgreSQL, model integrations, and AWS.",
        "Diagnosed API and data-flow bottlenecks using SQL, production metrics, and cloud logs.",
      ],
      focus:
        "Connected the interface, APIs, data flows, model integrations, and AWS infrastructure to improve the end-to-end generation path.",
      outcome:
        "Supported changes that reduced generation time from roughly 3–5 minutes to 60–90 seconds.",
      tech: [
        "React",
        "TypeScript",
        "Node.js",
        "Python",
        "AWS",
        "Generative AI",
      ],
      link: "https://phonon.studio/",
      linkLabel: "Visit Phonon",
    },
    cerebra: {
      name: "Cerebra",
      category: "02 / OPEN-SOURCE AI SYSTEMS",
      intro:
        "An open-source AI agent orchestration platform with a modular plugin architecture and real-world adoption.",
      role: "Platform design and development",
      contributions: [
        "Designed and built the AI agent orchestration platform.",
        "Created a modular plugin architecture for extending the platform’s capabilities.",
        "Developed the project as open-source software, with the implementation available for inspection.",
      ],
      focus:
        "Modularity and extensibility in the architecture of agentic systems.",
      outcome:
        "Published the implementation as open-source software for technical review and reuse.",
      tech: ["Rust", "TypeScript", "Python", "IPFS", "Open source"],
      link: "https://github.com/PaulDotDev/Cerebra",
      linkLabel: "Explore the source",
    },
    votex: {
      name: "Votex",
      category: "03 / ON-CHAIN GOVERNANCE",
      intro: "Secure, verifiable proposals and voting on Solana.",
      role: "On-chain program engineering",
      contributions: [
        "Designed the on-chain Rust programs that power voting on Votex.",
        "Paired the voting programs with Realms governance.",
        "Built for secure, verifiable proposals on the Solana network.",
      ],
      focus:
        "Verifiable behavior at the program layer, integrated with a governance system.",
      outcome:
        "Delivered a voting flow designed for secure, verifiable governance on Solana.",
      tech: ["Rust", "TypeScript", "Solana", "Realms", "AWS"],
      link: "https://votex.so/",
      linkLabel: "Visit Votex",
    },
    saber: {
      name: "SaberDAO",
      category: "04 / PROTOCOL ENGINEERING",
      intro:
        "Engineering the safe decommissioning of a DeFi protocol and a secure path for users to retrieve their assets.",
      role: "Protocol decommissioning lead",
      contributions: [
        "Led the safe decommissioning of the protocol.",
        "Built the path for users to securely extract multi-millions in USDC, SOL, and SBR tokens.",
        "Focused delivery on a safe exit from the platform for existing users.",
      ],
      focus:
        "Reliability matters most when real users and real assets depend on the outcome.",
      outcome:
        "Delivered a recovery path focused on a safe transition for existing users.",
      tech: ["TypeScript", "Rust", "DeFi", "Solana"],
      link: "https://saberdao.so/",
      linkLabel: "Visit SaberDAO",
    },
  };
  const dialog = document.getElementById("projectDialog");
  const content = document.getElementById("dialogContent");
  let opener = null;
  function openProject(id, button) {
    const project = projects[id];
    if (!project) return;
    if (!dialog.open) opener = button;
    content.replaceChildren();
    const coverName = {
      phonon: "phonon",
      cerebra: "cerebra",
      votex: "votex",
      saber: "saberdao",
    }[id];
    if (coverName) {
      const cover = document.createElement("img");
      cover.className = "dialog-cover";
      cover.src = `assets/${coverName}-cover.webp`;
      cover.alt = "";
      cover.width = 1536;
      cover.height = 1024;
      content.append(cover);
    }
    const eyebrow = document.createElement("span");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = project.category;
    const title = document.createElement("h2");
    title.id = "dialogTitle";
    title.textContent = project.name;
    const intro = document.createElement("p");
    intro.className = "dialog-intro";
    intro.textContent = project.intro;
    const roleHeading = document.createElement("h3");
    roleHeading.textContent = "My role";
    const role = document.createElement("p");
    role.className = "dialog-role";
    role.textContent = project.role;
    const delivery = document.createElement("h3");
    delivery.textContent = "What I delivered";
    const list = document.createElement("ul");
    project.contributions.forEach((text) => {
      const item = document.createElement("li");
      item.textContent = text;
      list.append(item);
    });
    const approach = document.createElement("h3");
    approach.textContent = "Technical approach";
    const focus = document.createElement("p");
    focus.className = "dialog-intro";
    focus.textContent = project.focus;
    const outcomeHeading = document.createElement("h3");
    outcomeHeading.textContent = "Outcome";
    const outcome = document.createElement("p");
    outcome.className = "dialog-outcome";
    outcome.textContent = project.outcome;
    const tags = document.createElement("div");
    tags.className = "dialog-tags";
    project.tech.forEach((text) => {
      const tag = document.createElement("span");
      tag.textContent = text;
      tags.append(tag);
    });
    const actions = document.createElement("div");
    actions.className = "dialog-actions";
    const link = document.createElement("a");
    link.className = "btn btn-primary";
    link.href = project.link;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = project.linkLabel + " ↗";
    link.addEventListener("click", () => track(`project_${id}_external`));
    const resume = document.createElement("a");
    resume.className = "text-link";
    resume.href = "#resume";
    resume.textContent = "View full résumé ↗";
    resume.addEventListener("click", () => dialog.close());
    actions.append(link, resume);
    const next = document.createElement("button");
    next.className = "dialog-next";
    next.type = "button";
    const keys = Object.keys(projects);
    const nextId = keys[(keys.indexOf(id) + 1) % keys.length];
    next.textContent = "Next: " + projects[nextId].name + " →";
    next.addEventListener("click", () => {
      openProject(nextId, next);
      const heading = document.getElementById("dialogTitle");
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    });
    actions.append(next);
    content.append(
      eyebrow,
      title,
      intro,
      roleHeading,
      role,
      delivery,
      list,
      approach,
      focus,
      outcomeHeading,
      outcome,
      tags,
      actions,
    );
    if (!dialog.open) dialog.showModal();
    document.body.style.overflow = "hidden";
    dialog.scrollTop = 0;
  }
  document.querySelectorAll("[data-project]").forEach((button) =>
    button.addEventListener("click", () => {
      track(`project_${button.dataset.project}`);
      openProject(button.dataset.project, button);
    }),
  );
  dialog
    .querySelector(".dialog-close")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (
        event.clientX < r.left ||
        event.clientX > r.right ||
        event.clientY < r.top ||
        event.clientY > r.bottom
      )
        dialog.close();
    }
  });
  dialog.addEventListener("close", () => {
    document.body.style.overflow = "";
    opener?.focus({ preventScroll: true });
  });
})();

(() => {
  const details = document.getElementById("resumeDetails");
  const resume = document.getElementById("resume");
  function revealResume() {
    if (details) details.open = true;
  }
  document
    .querySelectorAll('a[href="#resume"]')
    .forEach((link) => link.addEventListener("click", revealResume));
  // Also handles the résumé link created inside a project dialog.
  document.addEventListener("click", (event) => {
    if (event.target.closest('a[href="#resume"]')) revealResume();
  });
  addEventListener("hashchange", () => {
    if (location.hash === "#resume") revealResume();
  });
  if (location.hash === "#resume") revealResume();
  const printButton = document.getElementById("printResume");
  printButton?.addEventListener("click", () => {
    revealResume();
    window.print();
  });
  let wasOpen = false;
  addEventListener("beforeprint", () => {
    wasOpen = details?.open;
    revealResume();
  });
  addEventListener("afterprint", () => {
    if (details) details.open = wasOpen;
  });
  const navItems = [...document.querySelectorAll('#navlinks a[href^="#"]')];
  const sections = navItems
    .map((link) => ({
      link,
      element: document.querySelector(link.getAttribute("href")),
    }))
    .filter((item) => item.element);
  let scrollQueued = false;
  function markSection() {
    scrollQueued = false;
    let active = null;
    for (const item of sections) {
      if (item.element.getBoundingClientRect().top <= 160) active = item;
    }
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 30)
      active = sections.at(-1);
    sections.forEach((item) => {
      if (item === active) item.link.setAttribute("aria-current", "location");
      else item.link.removeAttribute("aria-current");
    });
  }
  addEventListener(
    "scroll",
    () => {
      if (!scrollQueued) {
        scrollQueued = true;
        requestAnimationFrame(markSection);
      }
    },
    { passive: true },
  );
  markSection();
  if (
    !matchMedia("(prefers-reduced-motion: reduce)").matches &&
    "IntersectionObserver" in window
  ) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    document
      .querySelectorAll(
        ".section-heading,.project,.support-project,.about-copy,.experience-row,.resume-overview",
      )
      .forEach((element) => {
        if (element.getBoundingClientRect().top > innerHeight) {
          element.classList.add("reveal-item");
          observer.observe(element);
        }
      });
  }
})();
