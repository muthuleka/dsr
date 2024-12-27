import React, { useEffect, useRef,useState} from "react";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import app from "../../firebase";
import "./Sidenavbar.css";
import logo from "../../Assets/logo.jpeg";
import { CiHome } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";
import { MdHighQuality } from "react-icons/md";
import { FaInternetExplorer } from "react-icons/fa";
import { FiCamera } from "react-icons/fi";
import { MdSystemSecurityUpdate } from "react-icons/md";
import { FiUpload } from "react-icons/fi";
import { IoCloseOutline } from "react-icons/io5";
import { IoMdAdd } from "react-icons/io";
import axios from "axios";
import quality from "../../Assets/gallery.jpg"

const Sidenavbar = () => {
  const [open, setopen] = useState("profile");
  //popup open close state
  const [image, setimage] = useState(false);

  //map function state and firebase la dataurl convert 
  const [arrays, setarrays] = useState([]);
  const [intern,setintern] = useState([]);
  const [gallery,setgallery] = useState([])
 //image show agura id set panna
  const [file, setFile] = useState(null);
  const [file1, setFile1] = useState();

  //delete process complete anathum automatic ah update agi view agum
  const [file2, setFile2] = useState(false);

  //button true ah irunthu na update btn false ah irunthuchu na submit btn
  const [hide,sethide] = useState(false); 

  //update state
  const [data,setdata] = useState("");
  
  //popup open event
  const [active,setactive] = useState("");
  


  function dashboard(e) {
    setopen(e);
    console.log(e);
  }

  function edit(event) {
    setimage(true);
    sethide(false);
    setactive(event);
  }

  function close() {
    setimage(false);
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      console.log("File selected:", selectedFile.name);
    } else {
      console.log("No file selected");
    }
  };

  console.log(File);   
  





//post create

const handleUpload = async () => {
  if (!file) {
      console.error("No file selected to upload");
      return;
  }

    //upload create method
const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
      console.error("Invalid file type. Only images are allowed.");
      return;
  }

  try {
      const storage = getStorage(app);
      const storageRef = ref(storage, "images/" + file.name);

      // Upload the file to Firebase storage
      await uploadBytes(storageRef, file);

      // Get the download URL for the uploaded file
      const dataUrl = await getDownloadURL(storageRef);
      console.log("Download URL:", dataUrl);

      // Create a FormData object to send the file with the 'file' field in the form-data
      const formData = new FormData();
      formData.append("file", file);  // Append the actual file

      // Send the form data to your backend (POST request)
      const result = await axios.post("http://127.0.0.1:8000/upload/", formData, {
          headers: {
              'Content-Type': 'multipart/form-data', // Important: tell the server we're sending form-data
          },
      });
      console.log(result); 
      
      if (result) {
        setFile2(!file2)
        setimage(false)

      }
      // Log the server response

      // Update the frontend state with the new URL if it's not already added
      setarrays(prev => (prev.includes(dataUrl) ? prev : [...prev, dataUrl]));

      // Clear the file input field after a successful upload
      setFile(null);
  } catch (err) {
    console.error("Error:", err.response?.data || err.message);
      
  }
};

//ViewAll 

useEffect(()=>{
    const getData = async () => {
          try {
            const response = await axios.get("http://127.0.0.1:8000/files/")
            console.log(response.data);
            setarrays(response.data)
          } catch (error) {
            console.error("Error uploading file:", error);
          }
        }
        getData();
  },[file2])

//Delete

async function deleteimg(e) {
  console.log(e);
  
  try {
    const result = await axios.delete(`http://127.0.0.1:8000/files/${e}/`)
    console.log(result);
  if (result) {
    setFile2(!file2)
  }
  } catch (error) {
    console.log(error);
  }
}

//update

async function updateimg(event,open) {
  try {
      setimage(true); // Open the uploader popup
      setdata(event)
      setactive(open)
      const res = await axios.get(`http://127.0.0.1:8000/files/${event}`);
      const fileUrl = res.data.file;
      console.log(fileUrl);
      setFile1(fileUrl); // Store the file URL for display, but not for setting `value`
      sethide(true)
  } catch (err) {
      console.log(err);
  }
}

 console.log(file);

const updatedata = async () => {
  console.log(file);
  
  if (!file) {
      console.error("No file selected to upload");
      return;
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
      console.error("Invalid file type. Only images are allowed.");
      return;
  }

  try {
      const storage = getStorage(app);
      const storageRef = ref(storage, "images/" + file.name);

      await uploadBytes(storageRef, file);

      const dataUrl = await getDownloadURL(storageRef);
      console.log("Download URL:", dataUrl);

      const formData = new FormData();
      formData.append("file", file);  // Check this
      console.log("FormData Sent:", formData);
      console.log(data);

     const result = await axios.put(`http://127.0.0.1:8000/files/${data}/`, formData, {
    headers: {
        'Content-Type': 'multipart/form-data',
    },
});


      console.log("Result:", result); 
      if (result) {
        setFile2(!file2)
        setimage(false)

      } // Debug response from server

      setarrays((prev) => (prev.includes(dataUrl) ? prev : [...prev, dataUrl]));
      setFile(null);
  } catch (err) {
      console.error("Update Error:", err.response?.data || err.message);
  }
};

//intern create

const internUpload = async () => {
  if (!file) {
      console.error("No file selected to upload");
      return;
  }

const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
      console.error("Invalid file type. Only images are allowed.");
      return;
  }

  try {
      const storage = getStorage(app);
      const storageRef = ref(storage, "images/" + file.name);

      // Upload the file to Firebase storage
     await uploadBytes(storageRef, file);

      // Get the download URL for the uploaded file
      const dataUrl = await getDownloadURL(storageRef);
      console.log("Download URL:", dataUrl);

      // Create a FormData object to send the file with the 'file' field in the form-data
      const formData = new FormData();
      formData.append("file", file);  // Append the actual file

      // Send the form data to your backend (POST request)
      const result = await axios.post("http://127.0.0.1:8000/create/", formData, {
          headers: {
              'Content-Type': 'multipart/form-data', // Important: tell the server we're sending form-data
          },
      });
      console.log(result); 
      
      if (result) {
        setFile2(!file2)
        setimage(false)

      }
      // Log the server response

      // Update the frontend state with the new URL if it's not already added
      setintern(prev => (prev.includes(dataUrl) ? prev : [...prev, dataUrl]));

      // Clear the file input field after a successful upload
      setFile(null);
  } catch (err) {
    console.error("Error:", err.response?.data || err.message);
      
  }
};

//intern ViewAll 

useEffect(()=>{
  const getData = async () => {
        try {
          const response = await axios.get("http://127.0.0.1:8000/internfiles/")
          console.log(response.data);
          setintern(response.data)
        } catch (error) {
          console.error("Error uploading file:", error);
        }
      }
      getData();
},[file2])

//intern Delete

async function interndeleteimg(e) {
  console.log(e);
  
  try {
    const result = await axios.delete(`http://127.0.0.1:8000/internfiles/${e}/`)
    console.log(result);
  if (result) {
    setFile2(!file2)
  }
  } catch (error) {
    console.log(error);
  }
}

//intern update

async function internupdateimg(event,open) {
  try {
      setimage(true); // Open the uploader popup
      setdata(event)
      setactive(open)
      const res = await axios.get(`http://127.0.0.1:8000/files/${event}`);
      const fileUrl = res.data.file;
      console.log(fileUrl);
      setFile1(fileUrl); // Store the file URL for display, but not for setting `value`
      sethide(true)
  } catch (err) {
      console.log(err);
  }
}

 console.log(file);

const internupdate = async () => {
  console.log(file);
  
  if (!file) {
      console.error("No file selected to upload");
      return;
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
      console.error("Invalid file type. Only images are allowed.");
      return;
  }

  try {
      const storage = getStorage(app);
      const storageRef = ref(storage, "images/" + file.name);

      await uploadBytes(storageRef, file);

      const dataUrl = await getDownloadURL(storageRef);
      console.log("Download URL:", dataUrl);

      const formData = new FormData();
      formData.append("file", file);  // Check this
      console.log("FormData Sent:", formData);
      console.log(data);

     const result = await axios.put(`http://127.0.0.1:8000/internfiles/${data}/`, formData, {
    headers: {
        'Content-Type': 'multipart/form-data',
    },
});


      console.log("Result:", result); 
      if (result) {
        setFile2(!file2)
        setimage(false)

      } // Debug response from server

      setintern((prev) => (prev.includes(dataUrl) ? prev : [...prev, dataUrl]));
      setFile(null);
  } catch (err) {
      console.error("Update Error:", err.response?.data || err.message);
  }
};

//gallery post

const galleryUpload = async () => {
  if (!file) {
      console.error("No file selected to upload");
      return;
  }

const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
      console.error("Invalid file type. Only images are allowed.");
      return;
  }

  try {
      const storage = getStorage(app);
      const storageRef = ref(storage, "images/" + file.name);

      // Upload the file to Firebase storage
     await uploadBytes(storageRef, file);

      // Get the download URL for the uploaded file
      const dataUrl = await getDownloadURL(storageRef);
      console.log("Download URL:", dataUrl);

      // Create a FormData object to send the file with the 'file' field in the form-data
      const formData = new FormData();
      formData.append("file", file);  // Append the actual file

      // Send the form data to your backend (POST request)
      const result = await axios.post("http://127.0.0.1:8000/post/", formData, {
          headers: {
              'Content-Type': 'multipart/form-data', // Important: tell the server we're sending form-data
          },
      });
      console.log(result); 
      
      if (result) {
        setFile2(!file2)
        setimage(false)

      }
      // Log the server response

      // Update the frontend state with the new URL if it's not already added
      setgallery(prev => (prev.includes(dataUrl) ? prev : [...prev, dataUrl]));

      // Clear the file input field after a successful upload
      setFile(null);
  } catch (err) {
    console.error("Error:", err.response?.data || err.message);
      
  }
};

//gallery ViewAll 

useEffect(()=>{
  const getData = async () => {
        try {
          const response = await axios.get("http://127.0.0.1:8000/galleryfiles/")
          console.log(response.data);
          setgallery(response.data)
        } catch (error) {
          console.error("Error uploading file:", error);
        }
      }
      getData();
},[file2])

// gallery Delete

async function gallerydeleteimg(e) {
  console.log(e);
  
  try {
    const result = await axios.delete(`http://127.0.0.1:8000/galleryfiles/${e}/`)
    console.log(result);
  if (result) {
    setFile2(!file2)
  }
  } catch (error) {
    console.log(error);
  }
}

// gallery update

async function galleryupdateimg(event,open) {
try {
    setimage(true); // Open the uploader popup
    setdata(event)
    setactive(open)
    const res = await axios.get(`http://127.0.0.1:8000/galleryfiles/${event}`);
    const fileUrl = res.data.file;
    console.log(fileUrl);
    setFile1(fileUrl); // Store the file URL for display, but not for setting `value`
    sethide(true)
} catch (err) {
    console.log(err);
}
}

console.log(file);

const galleryupdate = async () => {
console.log(file);

if (!file) {
    console.error("No file selected to upload");
    return;
}

const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
if (!allowedTypes.includes(file.type)) {
    console.error("Invalid file type. Only images are allowed.");
    return;
}

try {
    const storage = getStorage(app);
    const storageRef = ref(storage, "images/" + file.name);

    await uploadBytes(storageRef, file);

    const dataUrl = await getDownloadURL(storageRef);
    console.log("Download URL:", dataUrl);

    const formData = new FormData();
    formData.append("file", file);  // Check this
    console.log("FormData Sent:", formData);
    console.log(data);

   const result = await axios.put(`http://127.0.0.1:8000/galleryfiles/${data}/`, formData, {
  headers: {
      'Content-Type': 'multipart/form-data',
  },
});


    console.log("Result:", result); 
    if (result) {
      setFile2(!file2)
      setimage(false)

    } // Debug response from server

    setgallery((prev) => (prev.includes(dataUrl) ? prev : [...prev, dataUrl]));
    setFile(null);
} catch (err) {
    console.error("Update Error:", err.response?.data || err.message);
}
};


  return (
    <>

      <div className="sidenavbar">
        <div className="sidenav_left">
          <div className="sidenav_logo">
            <img src={logo} alt="" />
          </div>
          <div className="sidenav_list">
  

            <div className="list1" onClick={() => dashboard("profile")}>
              <p>
                <CgProfile className="list_i" />
              </p>
              <h4>Profile</h4>
            </div>

            <div className="list1" onClick={() => dashboard("quality")}>
              <p>
                <MdHighQuality className="list_i" />
              </p>
              <h4>Quality</h4>
            </div>

            <div className="list1" onClick={() => dashboard("system")}>
              <p>
                <MdSystemSecurityUpdate className="list_i" />
              </p>
              <h4>DSR systems</h4>
            </div>

            <div className="list1" onClick={() => dashboard("internshi")}>
              <p>
                <FaInternetExplorer className="list_i" />
              </p>
              <h4>Internship</h4>
            </div>

            <div className="list1" onClick={() => dashboard("gallery")}>
              <p>
                <FiCamera className="list_i" />
              </p>
              <h4>Gallery</h4>
            </div>
          </div>
        </div>
   
        <div className="sidenav_right">
           <div className="right_head">
            {open == "profile" && (
              <div className="right_profile">
                <div className="pro">
                  <h2>PROFILE</h2>
                  <p>
                    <IoMdAdd className="add_i" onClick={() => edit("f1")} />
                  </p>
                </div>
                {arrays.map(function (data) {
                  return (
                    <div className="ch" key={data.id}>
                      <img src={data.file} alt="" />
                      <div className="profile_btn">
                        <button onClick={()=>updateimg(data.id,"f1")} >Update</button>
                        <button onClick={()=>deleteimg(data.id)}>Delete</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div> 

          {open == "quality" && (
            <div class="right_head">
              <div className="quality">
                <div className="pro">
                  <h2>QUALITY</h2>
                  <p>
                    <IoMdAdd className="add_i" onClick={() => edit("f2")} />
                  </p>
                </div>
               <div className="qua">
                  <img src={quality} alt="" />
                  
                  <div className="profile_btn">
                    <button>Update</button>
                    <button>Delete</button>
                  </div>
                  </div>
              
              </div>
            </div>
          )}

          {open == "system" && (
            <div className="system">
              <div className="pro">
                <h2>SYSTEMS</h2>
                <p>
                  <IoMdAdd className="add_i" onClick={() => edit("f3")} />
                </p>
              </div>
             <div className="sys">
                  <img src={quality} alt="" />

                  <div className="profile_btn">
                    <button>Update</button>
                    <button>Delete</button>
                  </div>
                  </div>
            
            </div>
          )}

          {open == "internshi" && (
            <div className="internship">
              <div className="pro">
                <h2>INTERNSHIP</h2>
                <p>
                  <IoMdAdd className="add_i" onClick={() => edit("f4")} />
                </p>
              </div>
              
                <div className="gridcheck">
                {intern.map(function name(data) {
                  return(
                    <div className="internship2" key ={data.id}>
                    <div className="internship1">
                      <img src={data.file} alt="" />
                      <div className="edit_btn1" onClick={() => edit("f4")}>
                      <p>
                        <FiUpload />
                      </p>
                </div>
                <div className="intern_btn">
                    <button onClick={()=>internupdateimg(data.id,"f4")}>Update</button>
                    <button onClick={()=>interndeleteimg(data.id)}>Delete</button>
                </div>
                </div>
                </div>
                  )
                })}
                </div>
                 
              
            </div>
          )}

          {open == "gallery" && (
            <div className="gallery" key={data.id}>
              <div className="pro">
                <h2>OUR SERVICE</h2>
                <p>
                  <IoMdAdd className="add_i" onClick={() => edit("f5")} />
                </p>
              </div>
              
            {gallery.map(function(data) {
              return(
                <div className="gallery1" key ={data.id}>
                    <img src={data.file} alt="" />
                    <div className="edit_btn" onClick={() => edit("f5")}>
                      <p>
                        <FiUpload />
                      </p>
                    </div>
                    <div className="profile_btn1">
                      <button onClick={()=>galleryupdateimg(data.id,"f5")}>Update</button>
                      <button onClick={()=>gallerydeleteimg(data.id)}>Delete</button>
                    </div>
                  </div>
              )
            })}
              
            </div>
          )}
        </div>

        <div className={image ? "popup1" : "popup"}>
          {file1 && (
        <div>
          <p>Current File: {file1}</p>
          <img src={file1} alt="Selected File Preview" style={{ maxWidth: '100px' }} />
        </div>
        )}

          <div className="popup_head1">

             {active == "f1" && <div className="popup_head">
              <p>pro</p>
              <h3>Image Uploader</h3>
              <div className="close_btn" onClick={() => close()}>
                
                <p><IoCloseOutline className="close_i" /></p>
              </div>
                <input type="file" onChange={handleFileChange}/>
              <div className="popup_btn" >
             {!hide && <button onClick={handleUpload}>Submit</button>}
              {hide&& <button onClick={updatedata}>Update</button>}
              </div>
            </div>} 

            {active == "f2" && <div className="popup_head">
              <p>qua</p>
              <h3>Image Uploader</h3>
              <div className="close_btn" onClick={() => close()}>
                
                <p><IoCloseOutline className="close_i" /></p>
              </div>
                <input type="file" onChange={handleFileChange}/>
              <div className="popup_btn" >
             {!hide && <button onClick={handleUpload}>Submit</button>}
              {hide&& <button onClick={updatedata}>Update</button>}
              </div>
            </div>}

             {active == "f3" && <div className="popup_head">
              <p>sys</p>
              <h3>Image Uploader</h3>
              <div className="close_btn" onClick={() => close()}>
                
                <p><IoCloseOutline className="close_i" /></p>
              </div>
                <input type="file" onChange={handleFileChange}/>
              <div className="popup_btn" >
             {!hide && <button onClick={handleUpload}>Submit</button>}
              {hide&& <button onClick={updatedata}>Update</button>}
              </div>
            </div>} 

            {active == "f4" && <div className="popup_head">
              <p>intern</p>
              <h3>Image Uploader</h3>
              <div className="close_btn" onClick={() => close()}>
                
                <p><IoCloseOutline className="close_i" /></p>
              </div>
                <input type="file" onChange={handleFileChange}/>
              <div className="popup_btn" >
             {!hide && <button onClick={internUpload}>Submit</button>}
              {hide && <button onClick={internupdate}>Update</button>}
              </div>
            </div>}

             {active == "f5" && <div className="popup_head">
              <p>gal</p>
              <h3>Image Uploader</h3>
              <div className="close_btn" onClick={() => close()}>
                
                <p><IoCloseOutline className="close_i" /></p>
              </div>
                <input type="file" onChange={handleFileChange}/>
              <div className="popup_btn" >
             {!hide && <button onClick={galleryUpload}>Submit</button>}
              {hide&& <button onClick={galleryupdate}>Update</button>}
              </div>
            </div>} 

          </div>

        </div>
      </div>
    </>
  );
};

export default Sidenavbar;
