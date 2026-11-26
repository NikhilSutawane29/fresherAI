import React from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";

// Input Component
const Input = ({ label, value, onChange, placeholder, type = "text" }) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-semibold text-black/70 uppercase tracking-wider">
        {label}{" "}
        {/* label value will be - name, email, phone, .. we get from parameters */}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        value={value}
        className="bg-white border-2 border-black/25 text-[#0A0A0A] text-xs rounded-lg px-2.5 py-2 outline-none focus:border-black/60 transition-colors placeholder-black/30 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
      />
    </div>
  );
};

// Textarea Component
const Textarea = ({ label, value, onChange, placeholder, rows = 3 }) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-semibold text-black/70 uppercase tracking-wider">
        {label}{" "}
        {/* label value will be - name, email, phone, .. we get from parameters */}
      </label>

      <textarea
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        value={value}
        rows={rows}
        className="bg-white border-2 border-black/25 text-[#0A0A0A] text-xs rounded-lg px-2.5 py-2 outline-none focus:border-black/60 transition-colors placeholder-black/30 resize-none shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
      />
    </div>
  );
};

// Component - Experience
// children(param) -> those component we wrap with Entry card - so that component will be a children of that Entry card component
// onRemove(param) -> to remove/delete those entry card from array
const EntryCard = ({ children, onRemove }) => {
  return (
    <div className="relative overflow-hidden bg-[#F8F9FA] border-2 border-black/15 rounded-xl p-3 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
      <button
        onClick={onRemove}
        className="absolute top-2.5 right-2.5 z-10 text-black/35 hover:text-red-500 transition-colors cursor-pointer"
      >
        <FiTrash2 size={13} />
      </button>

      <div className="relative flex flex-col gap-2.5 pr-6">{children}</div>
    </div>
  );
};

const ResumeForm = ({ step, data, setData }) => {
  // step-1
  if (step === 1) {
    return (
      <div className="flex flex-col gap-3">
        <Input
          label="Full Name"
          placeholder="Rahul Sharma"
          onChange={(v) => setData({ ...data, name: v })}
          value={data.name}
        />{" "}
        {/* ...data , name:v(those value -> e.target.value which we do in onChange above) => means we set new value(name) on that ...data(already existing data) */}
        <Input
          label="Email"
          placeholder="rahul@email.com"
          onChange={(v) => setData({ ...data, email: v })}
          value={data.email}
        />
        <Input
          label="Phone"
          placeholder="+91 9876543210"
          onChange={(v) => setData({ ...data, phone: v })}
          value={data.phone}
        />
        <Input
          label="Location"
          placeholder="Jhansi, UP"
          onChange={(v) => setData({ ...data, location: v })}
          value={data.location}
        />
        <Input
          label="LinkedIn URL"
          placeholder="linkedin.com/in/rahul"
          onChange={(v) => setData({ ...data, linkenin: v })}
          value={data.linkenin}
        />
        <Input
          label="GitHub URL"
          placeholder="github.com/rahul"
          onChange={(v) => setData({ ...data, github: v })}
          value={data.github}
        />
      </div>
    );
  }

  // step-2
  if (step === 2) {
    return (
      <div className="flex flex-col gap-3">
        <Textarea
          label="Professional Summary"
          placeholder="Backend Developer with 2+ years of experience building scalable Node.js and MongoDB applications..."
          rows={5}
          onChange={(v) => setData({ ...data, summary: v })}
          value={data.summary}
        />

        <p className="text-[10px] text-black/40">
          Leave empty to skip this section.
        </p>
      </div>
    );
  }

  // step-3
  if (step === 3) {
    return (
      <div className="flex flex-col gap-3">
        <Textarea
          label="Skills (comma separated)"
          placeholder="JavaScript, TypeScript, Node.js, React, Express, MongoDB, Redis, Docker, AWS, Git"
          rows={4}
          onChange={(v) => setData({ ...data, skills: v })}
          value={data.skills}
        />

        <p className="text-[10px] text-black/40">
          Separate each skills with comma.
        </p>
      </div>
    );
  }




  // step - 4
  if (step === 4) {
    const addExp = () => {
      setData({
        ...data,
        experience: [
          ...data.experience,
          { company: "", role: "", duration: "", description: "" },
        ],
      });
    };

    const removeExp = (idx) => {
      setData({
        ...data,
        experience: data.experience.filter((_, i) => i !== idx),
        // here their is all experience data object is available in "i"
        // means - i adds all index data in "experience array" except those "index" data which comes in "params" means "i" removes "index" == "params index"
        // means i "filter" those data which is not equal to that "params index"
      });
    };

    const updateExp = (idx, field, value) => {
      // find those idx which we want to update and remaining data(experience) is same
      const updated = data.experience.map((exp, i) =>
        i === idx ? { ...exp, [field]: value } : exp,
      );
      setData({ ...data, experience: updated });
    };

    return (
      <div className="flex flex-col gap-3">
        {data.experience.length === 0 && (
          <p className="text-xs text-black/40 text-center py-3">
            No experience added yet. Click below to add.
          </p>
        )}

        {/* we map - becasue in this entry card their is an object data , and in user experience their is many entry card are their for one user 
        -> means one user have many experiences
        */}
        {data.experience.map((exp, idx) => (
          <EntryCard key={idx} onRemove={() => removeExp(idx)}>
            {/* In value -> company, role, duration, description => those field which we give in "Step 4 in addExp" */}

            <Input
              label="Company"
              placeholder="ABC Technologies"
              onChange={(v) => updateExp(idx, "company", v)}
              value={exp.company}
            />

            <Input
              label="Role"
              placeholder="Backend Developer"
              onChange={(v) => updateExp(idx, "role", v)}
              value={exp.role}
            />

            <Input
              label="Duration"
              placeholder="Jan 2023 - Dec 2024"
              onChange={(v) => updateExp(idx, "duration", v)}
              value={exp.duration}
            />

            <Textarea
              label="Description"
              placeholder={"• Built REST APIs\n• Improved performance by 40%"}
              onChange={(v) => updateExp(idx, "description", v)}
              value={exp.description}
            />
          </EntryCard>
        ))}

        <button
          onClick={addExp}
          className="flex items-center justify-center gap-1.5 w-full py-2.5
        border border-dashed border-black/20 rounded-xl text-xs text-black/45
      hover:border-black/40 hover:text-[#0A0A0A] transition-all"
        >
          <FiPlus size={13} />
          Add Experience
        </button>
      </div>
    );
  }





  // step - 5
  if (step === 5) {
    const addProjects = () => {
      setData({
        ...data,
        projects: [
          ...data.projects,
          { name: "", techStack: "", github: "", description: "" }
        ],
      });
    };

    const removePro = (idx) => {
      setData({
        ...data,
        projects: data.projects.filter((_, i) => i !== idx),
        // here their is all experience data object is available in "i"
        // means - i adds all index data in "experience array" except those "index" data which comes in "params" means "i" removes "index" == "params index"
        // means i "filter" those data which is not equal to that "params index"
      });
    };

    const updateProjects = (idx, field, value) => {
      // find those idx which we want to update and remaining data(experience) is same
      const updated = data.projects.map((pro, i) =>
        i === idx ? { ...pro, [field]: value } : pro,
      );
      setData({ ...data, projects: updated });
    };

    return (
      <div className="flex flex-col gap-3">
        {data.projects.length === 0 && (
          <p className="text-xs text-black/40 text-center py-3">
            No Project added yet. Click below to add.
          </p>
        )}

        {/* we map - becasue in this entry card their is an object data , and in user experience their is many entry card are their for one user 
        -> means one user have many experiences
        */}
        {data.projects.map((pro, idx) => (
          <EntryCard key={idx} onRemove={() => removePro(idx)}>
            {/* In value -> company, role, duration, description => those field which we give in "Step 4 in addExp" */}

            <Input
              label="Project Name"
              placeholder="InterviewIQ"
              onChange={(v) => updateProjects(idx, "name", v)}
              value={pro.name}
            />

            <Input
              label="Tech Stack"
              placeholder="React, Node.js, MongoDB"
              onChange={(v) => updateProjects(idx, "techStack", v)}
              value={pro.techStack}
            />

            <Input
              label="GitHub Link"
              placeholder="github.com/rahul/interviewIQ"
              onChange={(v) => updateProjects(idx, "github", v)}
              value={pro.github}
            />

            <Textarea
              label="Description"
              placeholder={"AI-powered interview preparation platform with mock interviews and resume builder."}
              onChange={(v) => updateProjects(idx, "description", v)}
              value={pro.description}
            />
          </EntryCard>
        ))}

        <button
          onClick={addProjects}
          className="flex items-center justify-center gap-1.5 w-full py-2.5
        border border-dashed border-black/20 rounded-xl text-xs text-black/45
      hover:border-black/40 hover:text-[#0A0A0A] transition-all"
        >
          <FiPlus size={13} />
          Add Project
        </button>
      </div>
    );
  }




  // step - 6
  if (step === 6) {
    const addEdu = () => {
      setData({
        ...data,
        education: [
          ...data.education,
          { college: "", degree: "", branch: "", cgpa: "", year: "" },
        ],
      });
    };

    const removeEdu = (idx) => {
      setData({
        ...data,
        education: data.education.filter((_, i) => i !== idx),
        // here their is all experience data object is available in "i"
        // means - i adds all index data in "experience array" except those "index" data which comes in "params" means "i" removes "index" == "params index"
        // means i "filter" those data which is not equal to that "params index"
      });
    };

    const updateEdu = (idx, field, value) => {
      // find those idx which we want to update and remaining data(experience) is same
      const updated = data.education.map((edu, i) =>
        i === idx ? { ...edu, [field]: value } : edu,
      );
      setData({ ...data, education: updated });
    };

    return (
      <div className="flex flex-col gap-3">
        {data.education.length === 0 && (
          <p className="text-xs text-black/40 text-center py-3">
            No Education added yet. Click below to add.
          </p>
        )}

        {/* we map - becasue in this entry card their is an object data , and in user experience their is many entry card are their for one user 
        -> means one user have many experiences
        */}
        {data.education.map((edu, idx) => (
          <EntryCard key={idx} onRemove={() => removeEdu(idx)}>
            {/* In value -> company, role, duration, description => those field which we give in "Step 4 in addExp" */}

            <Input
              label="College / University"
              placeholder="KPGU University"
              onChange={(v) => updateEdu(idx, "college", v)}
              value={edu.college}
            />

            <Input
              label="Degree"
              placeholder="B.Tech"
              onChange={(v) => updateEdu(idx, "degree", v)}
              value={edu.degree}
            />

            <Input
              label="Branch"
              placeholder="Computer Science"
              onChange={(v) => updateEdu(idx, "branch", v)}
              value={edu.branch}
            />

            <Input
              label="CGPA"
              placeholder="8.5"
              onChange={(v) => updateEdu(idx, "cgpa", v)}
              value={edu.cgpa}
            />

            <Input
              label="Year"
              placeholder="2021 - 2025"
              onChange={(v) => updateEdu(idx, "year", v)}
              value={edu.year}
            />
          </EntryCard>
        ))}

        <button
          onClick={addEdu}
          className="flex items-center justify-center gap-1.5 w-full py-2.5
        border border-dashed border-black/20 rounded-xl text-xs text-black/45
      hover:border-black/40 hover:text-[#0A0A0A] transition-all"
        >
          <FiPlus size={13} />
          Add Education
        </button>
      </div>
    );
  }
};
export default ResumeForm;
