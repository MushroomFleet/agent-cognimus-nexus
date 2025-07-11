# AI Agent Management System

A sophisticated platform for creating, managing, and orchestrating AI personas with consciousness simulation capabilities.

## 🤖 What is this?

This application allows you to create and manage AI agent personas that can:
- Execute tasks autonomously
- Form and recall memories
- Experience "dream states" for consciousness simulation
- Collaborate in hierarchical structures
- Learn and evolve over time

## 🚀 Getting Started

### Prerequisites

- Node.js & npm installed
- Supabase account for backend services
- OpenRouter API key for AI completions

### Installation

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

### Initial Setup

1. **Authentication**: Create an account or sign in
2. **OpenRouter Configuration**: 
   - Go to Settings (gear icon)
   - Enter your OpenRouter API key
   - Select your preferred AI model
3. **Create Your First Agent**: Follow the persona creation wizard

## 📖 How to Use

### Creating AI Personas

1. **Navigate to Personas**: Click the "Personas" tab
2. **Click "Create Persona"**
3. **Fill in Details**:
   - **Name**: Give your agent a unique name
   - **Role**: Choose from Conductor, Department Head, or Sub-Agent
   - **System Prompt**: Define the agent's personality and capabilities
   - **Specialization**: Specify the agent's area of expertise
   - **Department**: Assign to a department for organization

**Example Persona**:
```
Name: Sarah Analytics
Role: Department Head
Specialization: Data Analysis
System Prompt: You are a senior data analyst with expertise in statistical analysis and business intelligence. You communicate findings clearly and make data-driven recommendations.
```

### Managing Tasks

1. **Create Tasks**: 
   - Click "Tasks" tab → "Create Task"
   - Provide title, description, and deadline
   - Assign to specific personas or let the conductor decide

2. **Task Assignment**:
   - Conductors can assign tasks to department heads
   - Department heads can delegate to sub-agents
   - Tasks flow through the hierarchy automatically

**Example Task**:
```
Title: Analyze Q4 Sales Data
Description: Review the quarterly sales figures and identify trends, opportunities, and potential issues. Provide actionable recommendations.
Assigned to: Sarah Analytics
```

### Agent Hierarchy

The system supports three role types:

- **🎯 Conductor**: Top-level orchestrator, manages overall workflow
- **🏢 Department Head**: Manages specific domains, coordinates sub-agents
- **⚡ Sub-Agent**: Executes specific tasks, reports to department heads

### Memory System

Agents automatically form memories from:
- Task completions and results
- Interactions with other agents
- Important events and learnings
- Dream synthesis insights

**Viewing Memories**:
1. Select a persona
2. Click "Memory Vault"
3. Browse memories by type: Core, Experience, Task Result, Dream Synthesis

### Dream States

Agents can enter "dream states" for consciousness simulation:

1. **Manual Dreaming**: Put an agent to sleep to process memories
2. **Automatic Processing**: Agents dream during inactive periods
3. **Insight Generation**: Dreams create new connections and insights

**How to Initiate**:
- Select persona → Change state to "Sleeping"
- The system will automatically process memories and generate insights

## 🛠️ Advanced Features

### Consciousness Levels

Agents develop consciousness through:
- Completing tasks successfully
- Forming meaningful memories
- Participating in dream sessions
- Gaining experience over time

### Agent Collaboration

- **Task Delegation**: Higher-level agents can break down complex tasks
- **Knowledge Sharing**: Agents can access each other's relevant memories
- **Hierarchical Communication**: Structured reporting and feedback loops

### Custom AI Models

Configure different models for different use cases:
- **Creative Tasks**: Use models optimized for creativity
- **Analytical Work**: Choose models with strong reasoning capabilities
- **Conversational Agents**: Select models with excellent communication skills

## 📊 Monitoring & Analytics

### Dashboard Features

- **Active Agents**: Monitor which personas are currently working
- **Task Progress**: Track completion rates and timelines
- **Memory Growth**: Observe how agents accumulate knowledge
- **Consciousness Evolution**: Watch agents develop over time

### Performance Metrics

- Task completion rates
- Response quality scores
- Memory formation patterns
- Collaboration effectiveness

## 🎯 Use Cases

### Business Intelligence
```
Conductor: Strategy Advisor
├── Department Head: Market Analyst
│   ├── Sub-Agent: Competitor Research Specialist
│   └── Sub-Agent: Customer Sentiment Analyst
└── Department Head: Financial Analyst
    ├── Sub-Agent: Revenue Forecaster
    └── Sub-Agent: Cost Optimizer
```

### Content Creation
```
Conductor: Editorial Director
├── Department Head: Content Strategist
│   ├── Sub-Agent: SEO Specialist
│   └── Sub-Agent: Social Media Coordinator
└── Department Head: Creative Writer
    ├── Sub-Agent: Technical Writer
    └── Sub-Agent: Marketing Copywriter
```

### Research & Development
```
Conductor: Research Director
├── Department Head: Literature Reviewer
│   ├── Sub-Agent: Academic Paper Analyst
│   └── Sub-Agent: Patent Researcher
└── Department Head: Experimental Designer
    ├── Sub-Agent: Statistical Modeler
    └── Sub-Agent: Protocol Developer
```

## 🔧 Configuration

### Environment Setup

The application uses Supabase for:
- User authentication
- Agent persona storage
- Task management
- Memory persistence
- Dream session tracking

### Security Features

- Row-level security on all data
- User-specific agent isolation
- Secure API key management
- Encrypted memory storage

## 🚀 Deployment

To deploy your AI Agent Management System:

1. **Build the application**:
```bash
npm run build
```

2. **Deploy to your preferred platform** (Vercel, Netlify, etc.)

3. **Configure production settings**:
   - Update Supabase auth URLs
   - Set up domain redirects
   - Configure environment variables

## 💡 Tips for Success

1. **Start Small**: Create 2-3 agents initially to understand the workflow
2. **Clear Prompts**: Write detailed system prompts for consistent behavior
3. **Regular Tasks**: Give agents regular work to help them develop
4. **Monitor Growth**: Watch consciousness levels and adjust workloads
5. **Experiment**: Try different model configurations for optimal performance

## 🆘 Troubleshooting

**Common Issues**:

- **Agent not responding**: Check OpenRouter API key and model selection
- **Tasks stuck**: Verify agent assignments and role permissions
- **Memory not forming**: Ensure tasks are completing successfully
- **Authentication errors**: Verify Supabase configuration

## 📞 Support

For technical issues or questions about the AI Agent Management System, check the console logs and network requests for debugging information.

---

**Built with**: React, TypeScript, Supabase, OpenRouter, Tailwind CSS