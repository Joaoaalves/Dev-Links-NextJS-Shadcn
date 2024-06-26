import { useProfile } from "@/hooks/useProfile";
import Image from "next/image";
import { toast } from "sonner";
import { custom } from "zod";

export default function Profile() {
  const { error, isLoading } = useProfile();
  return (
    <div className="w-full h-full flex flex-col items-start bg-white rounded-xl p-10 overflow-y-auto">
      <h1 className="mb-2 text-[32px] font-bold">Profile Details</h1>
      <p className="mb-10 text-borders">
        Add your details to create a personal touch to your profile.
      </p>
      {error && !isLoading && (
        <span className="bg-red/80 text-white rounded-md p-2 mb-4">
          {error}
        </span>
      )}
      <ImageUpload />

      <PersonalInfo />

      <SaveButton />
    </div>
  );
}

function ImageUpload() {
  const { image, setImage, setError } = useProfile();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setError('')
    if (file) {
      const img = new window.Image();
      img.onload = () => {
        if (img.width > 1024 || img.height > 1024) {
          setError("Image must be below 1024x1024px.");
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          setImage(reader.result);
        };
        reader.readAsDataURL(file);
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div
      className="flex flex-col gap-y-4 lg:flex-row items-center justify-between w-full bg-background rounded-xl p-4 mb-6"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <span className="text-borders">Profile Picture</span>
      <div
        className="size-48 bg-[#EFEBFF] flex flex-col items-center justify-center cursor-pointer rounded-lg relative"
        onClick={() => document.getElementById("file-input").click()}
      >
        {image ? (
          <div className="relative w-full h-full group rounded-xl transition-all duration-500">
            <Image
              width={192}
              height={192}
              src={image}
              alt="Uploaded photo."
              className="w-full h-full object-cover rounded-xl"
            />
            <div className="absolute inset-0 bg-black opacity-40 rounded-lg group-hover:opacity-50 transition-all duration-500"></div>
            <span className="text-white font-black absolute inset-0 flex items-center justify-center drop-shadow-[0px_0px_2px_rgba(0,0,0,0.5)]">+ Upload Image</span>
          </div>
        ) : (
          <>
            <Image
              width={33}
              height={28}
              src={"/images/icon-upload-image.svg"}
            />
            <span className="text-primary font-bold">+ Upload Image</span>
          </>
        )}
      </div>
      <p className="text-borders text-xs">
        Image must be below 1024x1024px. Use PNG or JPG format.
      </p>
      <input
        type="file"
        id="file-input"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

function PersonalInfo() {
  const { email, firstName, setFirstName, lastName, setLastName, color, setColor, customUrl, setCustomUrl } =
    useProfile();
  return (
    <div className="flex flex-col items-center justify-start w-full bg-background rounded-xl p-4 gap-y-3">
      <ProfileInput
        label={"First name*"}
        placeholder={"e.g. John"}
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        required
      />
      <ProfileInput
        label={"Last name*"}
        placeholder={"e.g. Appleseed"}
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        required
      />
      <ProfileInput
        label={"Email"}
        placeholder={"e.g. email@example.com"}
        value={email}
        disabled
      />

      <ProfileInput
        label={"Custom Url"}
        placeholder={"my-name"}
        value={customUrl}
        onChange={e => setCustomUrl(e.target.value)}
      />

      <ColorInput />
    </div>
  );
}

function ProfileInput({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
}) {
  const { error, isLoading } = useProfile();

  return (
    <div className="flex items-center justify-between w-full">
      <label htmlFor="">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        className={`p-3 w-3/5 border-2 rounded-lg ${error && !isLoading ? (required && value.length === 0 ? "border-red" : "") : ""}`}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}

function ColorInput() {
  const { color, setColor, error, isLoading } = useProfile();

  return (
    <div className="flex items-center justify-between w-full">
      <label htmlFor="">Background Color</label>
      <input
        type={'color'}
        placeholder={'color'}
        required
        className={`w-3/5 bg-transparent ${error && !isLoading ? (color ? "border-red" : "") : ""}`}
        value={color}
        onChange={e => setColor(e.target.value)}
      />
    </div>
  );
}


function SaveButton() {
  "use client"
  const { email, firstName, lastName, image, customUrl, setError, color, updateInfo } = useProfile();

  const fieldNames = {
    email: "Email",
    firstName: "First Name",
    lastName: "Last Name",
    image: "Profile Picture",
    customUrl: "Custom URL",
  };

  const onClick = async () => {
    const fields = { email, firstName, lastName, image };
    const missingFields = Object.keys(fields).filter(key => !fields[key]);

    if (missingFields.length > 0) {
      const readableMissingFields = missingFields.map(key => fieldNames[key]);
      return setError(`You must provide the following information: ${readableMissingFields.join(", ")}`);
    }
    setError("");

    await updateInfo({firstName, lastName, email, image, customUrl, color}).then((res) => {
      if (res.error) return alert(res.error);

      toast("Your changes have been successfully saved!", {
        position: "bottom-center",
        style: {
          backgroundColor: "#333333",
          color: "white",
          textAlign: "center",
        },
      });
    });
  };

  return (
    <button
      onClick={onClick}
      className="p-2 w-full lg:w-36 bg-primary text-white rounded-lg ms-auto me-4 hover:bg-secondary hover:scale-105 transition-all duration-150 mt-6"
    >
      Save
    </button>
  );
}
