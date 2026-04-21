import fs from 'fs/promises';
import { generatePDF } from './src/services/pdfService.js';

async function generateTestPDF() {
  try {
    // Sample HTML with all report sections
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Interview Preparation Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #333;
      line-height: 1.6;
      background: white;
    }
    
    .container {
      max-width: 850px;
      margin: 0 auto;
      padding: 40px;
      background: white;
    }
    
    .header {
      border-bottom: 3px solid #2563eb;
      padding-bottom: 25px;
      margin-bottom: 30px;
    }
    
    .header h1 {
      font-size: 28px;
      color: #1e293b;
      margin-bottom: 10px;
    }
    
    .score-row {
      display: flex;
      gap: 30px;
      margin-top: 15px;
    }
    
    .score-item {
      flex: 1;
    }
    
    .score-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    
    .score-value {
      font-size: 32px;
      font-weight: bold;
      color: #2563eb;
    }
    
    .section {
      margin-bottom: 35px;
      page-break-inside: avoid;
    }
    
    .section h2 {
      font-size: 18px;
      color: #1e293b;
      margin-bottom: 15px;
      border-left: 4px solid #2563eb;
      padding-left: 12px;
    }
    
    .skill-gaps {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    
    .skill-tag {
      background: #dbeafe;
      color: #1e40af;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
    }
    
    .question-item {
      margin-bottom: 20px;
      padding: 15px;
      background: #f8fafc;
      border-left: 3px solid #2563eb;
      border-radius: 4px;
    }
    
    .question-number {
      font-weight: bold;
      color: #2563eb;
      margin-bottom: 8px;
    }
    
    .question-text {
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 8px;
      font-size: 14px;
    }
    
    .answer-label {
      font-size: 11px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
      margin-top: 8px;
    }
    
    .answer-text {
      color: #475569;
      font-size: 13px;
      line-height: 1.5;
    }
    
    .roadmap-item {
      margin-bottom: 25px;
      padding: 15px;
      background: #f0f9ff;
      border-radius: 6px;
      border-left: 3px solid #0284c7;
    }
    
    .roadmap-skill {
      font-weight: bold;
      color: #0c4a6e;
      font-size: 15px;
      margin-bottom: 10px;
    }
    
    .roadmap-resources {
      margin-bottom: 12px;
    }
    
    .roadmap-label {
      font-size: 11px;
      color: #0c4a6e;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
      margin-bottom: 6px;
    }
    
    .roadmap-list {
      margin-left: 15px;
    }
    
    .roadmap-list li {
      margin-bottom: 5px;
      color: #0c4a6e;
      font-size: 13px;
    }
    
    .resume-section {
      background: #fafafa;
      padding: 20px;
      border-radius: 6px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.6;
      color: #1e293b;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header Section -->
    <div class="header">
      <h1>Senior Software Engineer</h1>
      <div class="score-row">
        <div class="score-item">
          <div class="score-label">ATS Score</div>
          <div class="score-value">85%</div>
        </div>
        <div class="score-item">
          <div class="score-label">Match Score</div>
          <div class="score-value">78%</div>
        </div>
      </div>
    </div>
    
    <!-- Skill Gaps Section -->
    <div class="section">
      <h2>Skill Gaps</h2>
      <div class="skill-gaps">
        <div class="skill-tag">Kubernetes</div>
        <div class="skill-tag">Machine Learning</div>
        <div class="skill-tag">GraphQL</div>
        <div class="skill-tag">Advanced DevOps</div>
        <div class="skill-tag">Cloud Architecture</div>
      </div>
    </div>
    
    <!-- Technical Questions Section -->
    <div class="section">
      <h2>Technical Interview Questions</h2>
      <div class="question-item">
        <div class="question-number">Q1.</div>
        <div class="question-text">How would you design a microservices architecture for a large-scale e-commerce platform?</div>
        <div class="answer-label">Sample Answer:</div>
        <div class="answer-text">I would start by breaking down the system into domain-driven design bounded contexts: User Service, Product Service, Order Service, Payment Service, and Notification Service. Each service would have its own database following the database-per-service pattern. For communication, I would use event-driven architecture with a message broker like RabbitMQ or Kafka for asynchronous operations. API Gateway would handle routing and load balancing. Service discovery using tools like Consul or Kubernetes would manage service registration and health checks.</div>
      </div>
      <div class="question-item">
        <div class="question-number">Q2.</div>
        <div class="question-text">Explain the difference between Docker and Kubernetes. When would you use each?</div>
        <div class="answer-label">Sample Answer:</div>
        <div class="answer-text">Docker is a containerization platform that packages your application with all dependencies into a container image, ensuring consistency across development, testing, and production environments. Kubernetes is an orchestration platform that manages and deploys containers at scale, handling resource allocation, auto-scaling, self-healing, and rolling updates. Use Docker when you need containerization and consistency. Use Kubernetes when managing multiple containers across a cluster with requirements for high availability, scaling, and automated management.</div>
      </div>
      <div class="question-item">
        <div class="question-number">Q3.</div>
        <div class="question-text">How do you approach database optimization for a high-traffic application?</div>
        <div class="answer-label">Sample Answer:</div>
        <div class="answer-text">I would start with profiling and monitoring to identify bottlenecks using tools like Slow Query Logs and APM tools. Then I'd implement indexing strategies on frequently queried columns, normalize the schema to reduce redundancy, use caching layers like Redis for frequently accessed data, implement query optimization by rewriting complex queries, and consider database replication and sharding for horizontal scaling. I'd also evaluate denormalization for specific high-traffic read scenarios and implement pagination to reduce data transfer.</div>
      </div>
      <div class="question-item">
        <div class="question-number">Q4.</div>
        <div class="question-text">Describe your approach to security in REST API design.</div>
        <div class="answer-label">Sample Answer:</div>
        <div class="answer-text">Security starts with authentication using JWT tokens or OAuth 2.0 to verify user identity. Authorization ensures users can only access their own data through role-based or attribute-based access control. I would implement HTTPS/TLS for data in transit, use API rate limiting to prevent brute force attacks, validate and sanitize all inputs to prevent injection attacks, implement CORS policies carefully, use short-lived tokens with refresh mechanisms, and add comprehensive logging and monitoring. Regular security audits and keeping dependencies updated are also essential.</div>
      </div>
      <div class="question-item">
        <div class="question-number">Q5.</div>
        <div class="question-text">How would you implement caching in a distributed system?</div>
        <div class="answer-label">Sample Answer:</div>
        <div class="answer-text">I would use a multi-layered caching strategy: Browser caching for static assets using headers, CDN for global content distribution, application-level caching using Redis or Memcached for hot data, and database query caching. For cache invalidation, I'd use time-based expiry (TTL), event-based invalidation through message queues, or write-through/write-behind strategies. Cache stampede issues would be prevented using locks or probabilistic early expiration. I'd also consider cache warm-up strategies and monitor cache hit rates to optimize performance.</div>
      </div>
    </div>
    
    <!-- Behavioral Questions Section -->
    <div class="section">
      <h2>Behavioral Interview Questions</h2>
      <div class="question-item">
        <div class="question-number">Q1.</div>
        <div class="question-text">Tell me about a time when you had to learn a new technology quickly to meet a project deadline.</div>
        <div class="answer-label">Sample Answer:</div>
        <div class="answer-text">In my previous role, we needed to migrate a monolithic application to microservices using Kubernetes, which was new to our team. With a two-month deadline, I took the initiative to learn Kubernetes through online courses, documentation, and small proof-of-concept projects. I shared my learnings with the team through knowledge-sharing sessions, created internal documentation, and set up a sandbox environment for the team to practice. This accelerated everyone's learning curve, and we successfully completed the migration on time with minimal issues.</div>
      </div>
      <div class="question-item">
        <div class="question-number">Q2.</div>
        <div class="question-text">Describe a situation where you had to work with a difficult team member. How did you handle it?</div>
        <div class="answer-label">Sample Answer:</div>
        <div class="answer-text">In a previous project, a team member was not responding to code review comments and was resisting architectural changes. Instead of escalating immediately, I took them out for coffee to understand their perspective. I learned they felt unsupported in the transition. I suggested pair programming sessions to help them understand the new architecture. By showing empathy and involving them in the decision-making process, they became one of the strongest advocates for the new system. This taught me the importance of communication and understanding others' concerns before making judgments.</div>
      </div>
      <div class="question-item">
        <div class="question-number">Q3.</div>
        <div class="question-text">Tell me about a time when you made a significant mistake at work. How did you handle it?</div>
        <div class="answer-label">Sample Answer:</div>
        <div class="answer-text">During a production deployment, I deployed changes without running the full test suite, resulting in a critical bug that affected 10% of users. I immediately acknowledged the mistake to my team lead, worked with the team to create a hotfix, communicated transparently with stakeholders about the issue and timeline, and deployed the fix within 30 minutes. Post-incident, I proposed implementing automated deployment checks and mandatory code reviews which prevented similar issues. This experience reinforced the importance of process discipline and made me a more careful engineer.</div>
      </div>
      <div class="question-item">
        <div class="question-number">Q4.</div>
        <div class="question-text">Give an example of when you took initiative beyond your job description.</div>
        <div class="answer-label">Sample Answer:</div>
        <div class="answer-text">Noticing our deployments were taking 45 minutes, I invested time to optimize the CI/CD pipeline using Docker layer caching, parallel test execution, and better build artifact management. Over two weeks, I reduced deployment time to 12 minutes. Although this wasn't explicitly in my job description, I recognized it would improve team productivity. I documented the changes, trained the team on the new process, and it became a template for other teams in the company.</div>
      </div>
      <div class="question-item">
        <div class="question-number">Q5.</div>
        <div class="question-text">How do you stay updated with the latest trends and technologies in software development?</div>
        <div class="answer-label">Sample Answer:</div>
        <div class="answer-text">I maintain continuous learning through multiple channels: I read tech blogs like Medium and Dev.to, follow industry leaders on Twitter, contribute to open-source projects to apply new concepts, attend tech conferences and webinars annually, and take online courses on platforms like Udemy and Coursera. I also discuss new technologies with my team in weekly tech talks and experiment with new tools in personal projects before recommending them for production use.</div>
      </div>
    </div>
    
    <!-- Roadmap Section -->
    <div class="section">
      <h2>Learning Roadmap</h2>
      <div class="roadmap-item">
        <div class="roadmap-skill">Kubernetes</div>
        <div class="roadmap-resources">
          <div class="roadmap-label">Resources:</div>
          <ul class="roadmap-list">
            <li>Kubernetes Official Documentation and Tutorials</li>
            <li>"Kubernetes in Action" Book</li>
            <li>Linux Academy/Pluralsight Kubernetes Courses</li>
            <li>Kubernetes The Hard Way (hands-on guide)</li>
            <li>CNCF Cloud Native Computing Courses</li>
          </ul>
        </div>
        <div class="roadmap-resources">
          <div class="roadmap-label">Learning Steps:</div>
          <ul class="roadmap-list">
            <li>Understand containers and Docker fundamentals</li>
            <li>Learn Kubernetes architecture: Masters, Nodes, Pods, Services</li>
            <li>Practice basic deployments and scaling with kubectl</li>
            <li>Explore ConfigMaps, Secrets, and StatefulSets</li>
            <li>Implement Ingress controllers and network policies</li>
            <li>Learn Helm for package management</li>
            <li>Practice with AWS EKS or GKE environments</li>
          </ul>
        </div>
      </div>
      <div class="roadmap-item">
        <div class="roadmap-skill">Machine Learning Fundamentals</div>
        <div class="roadmap-resources">
          <div class="roadmap-label">Resources:</div>
          <ul class="roadmap-list">
            <li>Andrew Ng's Machine Learning Course (Coursera)</li>
            <li>"Hands-On Machine Learning" Book</li>
            <li>Fast.ai Practical Deep Learning Course</li>
            <li>TensorFlow and PyTorch Official Documentation</li>
            <li>Kaggle Competitions and Datasets</li>
          </ul>
        </div>
        <div class="roadmap-resources">
          <div class="roadmap-label">Learning Steps:</div>
          <ul class="roadmap-list">
            <li>Learn Python and NumPy, Pandas for data manipulation</li>
            <li>Understand supervised learning: regression and classification</li>
            <li>Master feature engineering and data preprocessing</li>
            <li>Learn unsupervised learning: clustering, dimensionality reduction</li>
            <li>Dive into neural networks and deep learning basics</li>
            <li>Practice with real-world ML projects on Kaggle</li>
            <li>Learn ML deployment and serving</li>
          </ul>
        </div>
      </div>
      <div class="roadmap-item">
        <div class="roadmap-skill">Advanced DevOps Practices</div>
        <div class="roadmap-resources">
          <div class="roadmap-label">Resources:</div>
          <ul class="roadmap-list">
            <li>HashiCorp Terraform and Ansible Documentation</li>
            <li>CloudAcademy DevOps Certification Paths</li>
            <li>"The DevOps Handbook" Book</li>
            <li>AWS/GCP/Azure Certifications</li>
            <li>Jenkins and GitLab CI/CD Documentation</li>
          </ul>
        </div>
        <div class="roadmap-resources">
          <div class="roadmap-label">Learning Steps:</div>
          <ul class="roadmap-list">
            <li>Master Infrastructure as Code with Terraform</li>
            <li>Learn configuration management with Ansible</li>
            <li>Deep dive into CI/CD pipeline design and implementation</li>
            <li>Explore monitoring and observability tools (Prometheus, Grafana)</li>
            <li>Learn log aggregation and analysis (ELK Stack)</li>
            <li>Practice multi-cloud deployment strategies</li>
            <li>Implement disaster recovery and high availability patterns</li>
          </ul>
        </div>
      </div>
    </div>
    
    <!-- Optimized Resume Section -->
    <div class="section">
      <h2>Optimized Resume</h2>
      <div class="resume-section">JOHN SMITH
Senior Software Engineer | Full-Stack Developer | Cloud Architect
Email: john.smith@email.com | Phone: (555) 123-4567 | LinkedIn: linkedin.com/in/johnsmith

PROFESSIONAL SUMMARY
Results-driven Senior Software Engineer with 8+ years of experience designing, developing, and deploying scalable web applications and microservices. Proven expertise in cloud architecture, DevOps, and leading technical teams. Skilled in full-stack development with Node.js, React, and Python. Strong background in building high-performance, secure systems serving millions of users.

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, Java, SQL
Frontend: React, Vue.js, HTML5, CSS3, Redux, TailwindCSS
Backend: Node.js, Express, Django, Django REST Framework, FastAPI
Databases: MongoDB, PostgreSQL, Redis, Elasticsearch
Cloud & DevOps: AWS (EC2, RDS, S3, Lambda), Docker, Kubernetes, Terraform
Tools: Git, Jenkins, GitLab CI/CD, Docker Compose, Prometheus, Grafana
Methodologies: Agile, Scrum, Microservices Architecture, TDD

PROFESSIONAL EXPERIENCE

TECH CORPORATION, Senior Software Engineer | 2021 – Present
• Led architecture design for microservices migration project, reducing deployment time from 45 minutes to 12 minutes and improving system scalability to handle 10x traffic
• Mentored 5 junior developers, conducting code reviews and establishing best practices that improved code quality metrics by 40%
• Designed and implemented a real-time data pipeline processing 1M+ events daily using Kafka and Python, enabling data-driven decision making
• Implemented comprehensive CI/CD pipeline using GitLab CI and Kubernetes, reducing time-to-market for features by 50%
• Optimized database queries and implemented caching strategy, reducing API response times by 65%

STARTUP INNOVATIONS, Full-Stack Engineer | 2018 – 2021
• Built and maintained Node.js + React SaaS platform serving 50,000+ active users, handling 1000+ concurrent users
• Implemented JWT-based authentication system and role-based access control for security compliance
• Created RESTful APIs and GraphQL endpoints serving mobile and web applications
• Implemented Docker containerization and Kubernetes orchestration for automated deployments
• Established automated testing practices achieving 85% code coverage

DIGITAL SOLUTIONS LLC, Junior Full-Stack Developer | 2015 – 2018
• Developed full-stack web applications using JavaScript, Node.js, MongoDB, and React
• Collaborated with 8-person development team in Agile/Scrum environment
• Fixed bugs and optimized existing code, improving application performance by 30%
• Participated in code reviews and contributed to documentation

EDUCATION
Bachelor of Science in Computer Science
State University, Graduated May 2015
GPA: 3.7/4.0

CERTIFICATIONS
AWS Certified Solutions Architect – Professional (2022)
Kubernetes Application Developer (CKAD) (2021)
AWS Certified Developer – Associate (2020)

PROJECTS & ACHIEVEMENTS
• Open-source Contributor: Active contributor to popular Node.js ecosystem projects with 200+ GitHub stars
• Technical Blog: Published 50+ technical articles on Medium with 100K+ total reads
• Conference Speaker: Presented on "Scaling Microservices with Kubernetes" at NodeConf 2023</div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p>Generated on December 15, 2024</p>
      <p>This is a test PDF generated to validate the report generation system</p>
    </div>
  </div>
</body>
</html>
    `;

    // Generate PDF from HTML
    const pdfBuffer = await generatePDF(htmlContent);

    // Write PDF to file
    await fs.writeFile('test-output.pdf', pdfBuffer);

    console.log('✅ PDF generated: test-output.pdf');
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    process.exit(1);
  }
}

generateTestPDF();
