import React, { useEffect,  useState } from "react";
import "./Sidenavbar.css";
import logo from "../../../Assets/logo.jpeg"
import { CgProfile } from "react-icons/cg";
import { MdHighQuality } from "react-icons/md";
import { FaInternetExplorer } from "react-icons/fa";
import { FiCamera } from "react-icons/fi";
import { MdSystemSecurityUpdate } from "react-icons/md";
import { IoCloseOutline } from "react-icons/io5";
import { IoMdAdd } from "react-icons/io";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getFirestore, collection, addDoc, getDocs, doc,updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import app from '../../../firebase'; // Ensure this is your Firebase initialization
import { ToastContainer,toast } from "react-toastify";



const Sidenavbar = () => {
  //single page la division route agura state
  const [open, setopen] = useState("profile");
  
//popup open close state
  const [image, setimage] = useState(false);
  //update state
  const [update, setupdate] = useState("");
  //input la file get agura state
  const [file, setFile] = useState(null);
  //get agura data using map function
  const [uploadedData, setUploadedData] = useState([]);
  const [intern, setintern] = useState([]);
  const [gallery,setgallery] = useState([])
  const [quality, setQuality] = useState([]);
  const [system, setSystem] = useState([]);
  console.log(quality);
  //update button click pannum pothu true ah irunthuchu na update btn show agum 
  const [hide, sethide] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state for the button

  //popup open event
  const [active, setactive] = useState("");
  const [updates, setupdates] = useState(false);
  const [disbalebtn, setdisbalebtn] = useState(false)

  


 //firebase la export pantratha variable la store pannirukom
  const storage = getStorage(app);
  const db = getFirestore(app);

 function dashboard(event) {
  setopen(event)
 }

 function edit(event) {
        sethide(false);
        setactive(event);
        setimage(true)
        setFile(null)
        setIsLoading(false)
        setdisbalebtn(false)
  }

  function close() {
    setimage(false);
    }
    console.log(image);
console.log(file);

// Upload file input
function inputdata(e) {
  if (e.target.files[0]) {
    setFile(e.target.files[0]);
  }
}
console.log(file);
//PROFILE FIREBASESTORE

async function submitFileUpload() {
  let toastId; 

  if (!file) {   
    console.error('No file selected for upload');
    toastId = toast("No file selected for upload");  
    return;
  }

  try {
    const storageRef = ref(storage, `dsr/${file.name}`);
    
    toastId = toast("Uploading..."); 
    setIsLoading(true);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    console.log(downloadURL);
    
    const createData = await addDoc(collection(db, 'dsr'), {
      name: file.name,
      url: downloadURL,
    });

    console.log('File uploaded successfully:', createData.id);
    document.querySelector('input[type="file"]').value = ''

    getUploadData(); // Refresh uploaded data
    setdisbalebtn(!disbalebtn)
    toast.update(toastId, {
      render: "File uploaded successfully",
      type: "success",
      autoClose: 1000,
      isLoading: false,
    });
  setTimeout(() => {
  setimage(false)
}, 1000);
  } catch (error) {
    console.error('Error uploading file:', error);
    toast.update(toastId, {
      render: "Error uploading file",
      type: "error",
      isLoading: false,
      autoClose: 3000,
    });
    setIsLoading(false); // Re-enable the submit button after successful upload

  }
}

console.log(file);

console.log(disbalebtn);

  // Fetch data in Firestore ==url get pannura method

 async function getUploadData() {
  try {
    const getData = await getDocs(collection(db, 'dsr'));
      console.log(getData);
      
      const data = getData.docs.map((doc) => ({
        id: doc.id,...doc.data(),
      }));
      console.log(data);
      
      setUploadedData(data);
  } catch (error) {
    console.error('Error fetching data from Firestore:', error);

  }
 }
  
 useEffect(() => {
    getUploadData();
  }, []);
console.log(uploadedData);


// Update a document in Firestore
async function updateFileUpload(docId) {
  console.log(docId);
  let toastId;
  if (!file) {
    console.error("No file selected for update.");
    toastId = toast("No file selected for update");  

    return;
  }
  if (!docId) {
    console.error("No document ID provided for update.");
    return;
  }
  try {
    console.log("Updating file for document ID:", docId);
    // Step 1: Get reference to the existing document
    const docRef = doc(db, "dsr", docId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.error("Document does not exist with ID:", docId);
      return;
    }

    const updatingData = docSnap.data();
    console.log("Updating document data:", updatingData);

     // Step 2: Delete old file from Firebase Storage if it exists
     if (updatingData.url) {
      const storageRef = ref(storage, `dsr/${updatingData.name}`);
      try {
    toastId = toast("Updating...");
    setupdates(true)

        await deleteObject(storageRef);
        console.log("Old file deleted successfully.");
      } catch (error) {
        console.warn("Error deleting old file. Proceeding with update:", error);
      }
    }

    // Step 3: Upload the new file to Firebase Storage
    const newFileRef = ref(storage, `dsr/${file.name}`);
    
    await uploadBytes(newFileRef, file);
    const newDownloadURL = await getDownloadURL(newFileRef);
    console.log("New file uploaded successfully. URL:", newDownloadURL);
    

    // Step 4: Update Firestore document with new file details
    await updateDoc(docRef, {
      name: file.name,
      url: newDownloadURL,
    });

    console.log("Firestore document updated successfully!");
    document.querySelector('input[type="file"]').value = ''

    // Step 5: Refresh uploaded data in UI


    setdisbalebtn(!disbalebtn)
    toast.update(toastId, {
      render: "File updated successfully",
      type: "success",
      autoClose: 3000,
      isLoading: false,
    });

setTimeout(() => {
  setimage(false)
  
}, 3000);
    getUploadData();
  
  } catch (error) {
    console.error("Error updating file and document:", error);
    toast.update(toastId, {
      render: "Error uploading file",
      type: "error",
      isLoading: false,
      autoClose: 3000,
    });
  }
}

// Example of how UpdateImg might be called
function handleUpdate(id) {
  console.log("Preparing to update document with ID:", id);

  const findData = uploadedData.find((data) => data.id === id);
  console.log(findData);
  
  if (!findData) {
    console.error("Document data not found for ID:", id);
    return;
  }
  setupdate(id); // Set setupdate to the ID of the document you're updating
  setactive("f1"); // Activate file update section in model
  setimage(true);   // Show image update model
  sethide(true);    // Change button to "Update"  
  setupdates(false)
  setdisbalebtn(false)
  setFile(null)

}

//DeleteImg 
async function deleteData(id) {
  try {
    // Log the id to check if it's valid
    console.log("Deleting document with ID:", id);
    
    const deleteVal = doc(db, "dsr", id);
    await deleteDoc(deleteVal);
    console.log('image Deleted');
   

    getUploadData(); // Optionally refresh the data after deletion
  } catch (error) {
    console.error("Error in DeleteImg function:", error);
   
  }
}

// Example of how DeleteImg might be called
// Ensure that the id passed is a valid string

async function DeleteImg(id) {
let toastId;
  if (id) {
    console.log(id);
    let toastId = toast.loading("Deleting image...", { // Create the toast first with loading state
      autoClose: false, // Don't auto close yet because we're still in progress
      isLoading: true,  // Show the loading state while deleting
    });
   deleteData(id); // Call with valid document id
  setTimeout(() => {
    toast.update(toastId, {
      render: "File has been deleted",
      type: "success", 
      autoClose: 3000,  
      isLoading: false, 
    });
  }, 1500);
  } else {
    console.error("Invalid ID passed to DeleteImg");
    toast.update(toastId, {
      render: "Error deleting file", // Error message
      type: "error", // Error type
      autoClose: 3000, // Close after 3 seconds
      isLoading: false, 
    });
  }
  
}

//INTERNSHIP 

async function internfileUpload() {
  let toastId;
  if (!file) {
    console.error('No file selected for upload');
    toastId = toast("No file selected for upload")
    return;
  }
  
  try {
    const storageRef = ref(storage, `intern/${file.name}`);
      toastId = toast("Uploading.....")
      setIsLoading(true)

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      console.log(downloadURL);
      
      const createData = await addDoc(collection(db, 'intern'), {
        name: file.name,
        url: downloadURL,
      });

      console.log('File uploaded successfully:', createData.id);
      document.querySelector('input[type="file"]').value = ''
  

      getInternData(); // Refresh uploaded data
      setdisbalebtn(!disbalebtn)
      toast.update(toastId, {
        render: "File uploaded successfully",
        type: "success",
        autoClose: 3000,
        isLoading: false,
      });

  setTimeout(() => {
    setimage(false)
    
  }, 3000);
  } catch (error) {
    console.error('Error uploading file:', error);
    toast.update(toastId, {
      render: "Error uploading file",
      type: "error",
      isLoading: false,
      autoClose: 3000,
    });
    setIsLoading(false)

  }
}
//get pantra method
async function getInternData() {
  try {
    const getData = await getDocs(collection(db, 'intern'));
      console.log(getData);
      
      const data = getData.docs.map((doc) => ({
        id: doc.id,...doc.data(),
      }));
      console.log(data);
      
      setintern(data);
  } catch (error) {
    console.error('Error fetching data from Firestore:', error);

  }
 }

 useEffect(() => {
  getInternData();
}, []);
console.log(intern); 

// Update a document in Firestore
async function internFileupdate(docId) {
  console.log(docId);
  
  let toastId;
  
  if (!file) {
    console.error("No file selected for update.");
    toastId = toast("No file selected for update");  

    return;
  }
  if (!docId) {
    console.error("No document ID provided for update.");
    return;
  }
  try {
    console.log("Updating file for document ID:", docId);

    // Step 1: Get reference to the existing document
    const docRef = doc(db, "intern", docId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.error("Document does not exist with ID:", docId);
      return;
    }

    const updatingData = docSnap.data();
    console.log("Updating document data:", updatingData);

     // Step 2: Delete old file from Firebase Storage if it exists
     if (updatingData.url) {
      const storageRef = ref(storage, `intern/${updatingData.name}`);
      toastId = toast("Updating...")
      setupdates(true)
      try {
        await deleteObject(storageRef);
        console.log("Old file deleted successfully.");
      } catch (error) {
        console.warn("Error deleting old file. Proceeding with update:", error);
      }
    }

    // Step 3: Upload the new file to Firebase Storage
    const newFileRef = ref(storage, `intern/${file.name}`);
    await uploadBytes(newFileRef, file);
    const newDownloadURL = await getDownloadURL(newFileRef);
    console.log("New file uploaded successfully. URL:", newDownloadURL);
    

    // Step 4: Update Firestore document with new file details
    await updateDoc(docRef, {
      name: file.name,
      url: newDownloadURL,
    });

    console.log("Firestore document updated successfully!");
    document.querySelector('input[type="file"]').value = ''
    // Step 5: Refresh uploaded data in UI
    setdisbalebtn(!disbalebtn)
    toast.update(toastId, {
      render: "File updated successfully",
      type: "success",
      autoClose: 3000,
      isLoading: false,
    });
setTimeout(() => {
  setimage(false)
  
}, 3000);
    getInternData();
  
  } catch (error) {
    console.error("Error updating file and document:", error);
    toast.update(toastId, {
      render: "Error updating file",
      type: "error",
      isLoading: false,
      autoClose: 3000,
    });
  }
}

// Example of how UpdateImg might be called
function internupdateimg(id) {
  console.log("Preparing to update document with ID:", id);

  const findData = intern.find((data) => data.id === id);
  console.log(findData);
  
  if (!findData) {
    console.error("Document data not found for ID:", id);
    return;
  }
  setupdate(id); // Set setupdate to the ID of the document you're updating
  setactive("f4"); // Activate file update section in model
  setimage(true);   // Show image update model
  sethide(true);    // Change button to "Update"
  setupdates(false)
  setdisbalebtn(false)
  setFile(null)

}

 //DeleteImg 
async function interndeleteData(id) {
  try {
    // Log the id to check if it's valid
    console.log("Deleting document with ID:", id);
    
    const deleteVal = doc(db, "intern", id);
    await deleteDoc(deleteVal);
    console.log('image Deleted');
    
    getInternData(); // Optionally refresh the data after deletion
  } catch (error) {
    console.error("Error in DeleteImg function:", error);
  }
}

// Example of how DeleteImg might be called
// Ensure that the id passed is a valid string

async function interndeleteimg(id) {
  let toastId;
  if (id) {
    console.log(id);
    let toastId = toast.loading("Deleting image...", { // Create the toast first with loading state
      autoClose: false, // Don't auto close yet because we're still in progress
      isLoading: true,  // Show the loading state while deleting
    });
    interndeleteData(id); // Call with valid document id
    setTimeout(() => {
      toast.update(toastId, {
        render: "File has been deleted",
        type: "success", 
        autoClose: 3000,  
        isLoading: false, 
      });
    }, 1500);
  } else {
    console.error("Invalid ID passed to DeleteImg");
    toast.update(toastId, {
      render: "Error deleting file", // Error message
      type: "error", // Error type
      autoClose: 3000, // Close after 3 seconds
      isLoading: false, // Hide loading spinner
    });
  }
} 

async function galleryFileUpload() {
  let toastId;
  if (!file) {
    console.error('No file selected for upload');
    toastId = toast("No file selected for upload")
    return;
  }
  
  try {
    const storageRef = ref(storage, `gallery/${file.name}`);
      toastId = toast("Uploading....")
      setIsLoading(true)
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      console.log(downloadURL);
      
      const createData = await addDoc(collection(db, 'gallery'), {
        name: file.name,
        url: downloadURL,
      });

      console.log('File uploaded successfully:', createData.id);
      document.querySelector('input[type="file"]').value = ''
      getGalleryData(); // Refresh uploaded data
      setdisbalebtn(!disbalebtn)

      toast.update(toastId, {
        render: "File uploaded successfully",
        type: "success",
        autoClose: 3000,
        isLoading: false,
      });
  setTimeout(() => {
    setimage(false)
    
  }, 3000);
  } catch (error) {
    console.error('Error uploading file:', error);
    toast.update(toastId, {
      render: "Error uploading file",
      type: "error",
      isLoading: false,
      autoClose: 3000,
    });
    setIsLoading(false)

  }
}

async function getGalleryData() {
  try {
    const getData = await getDocs(collection(db, 'gallery'));
      console.log(getData);
      
      const data = getData.docs.map((doc) => ({
        id: doc.id,...doc.data(),
      }));
      console.log(data);
      
      setgallery(data);
  } catch (error) {
    console.error('Error fetching data from Firestore:', error);

  }
}

useEffect(() => {
  getGalleryData();
}, []);
console.log(intern); 

async function galleryFileupdate(docId) {
  console.log(docId);
  let toastId;  
  if (!file) {
    console.error("No file selected for update.");
    toastId = toast("No file selected for update");  

    return;
  }
  if (!docId) {
    console.error("No document ID provided for update.");
    return;
  }
  try {
    console.log("Updating file for document ID:", docId);

    // Step 1: Get reference to the existing document
    const docRef = doc(db, "gallery", docId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.error("Document does not exist with ID:", docId);
      return;
    }

    const updatingData = docSnap.data();
    console.log("Updating document data:", updatingData);

     // Step 2: Delete old file from Firebase Storage if it exists
     if (updatingData.url) {
      const storageRef = ref(storage, `gallery/${updatingData.name}`);
      toastId = toast("Updating....")
      setupdates(true)
      try {
        await deleteObject(storageRef);
        console.log("Old file deleted successfully.");
      } catch (error) {
        console.warn("Error deleting old file. Proceeding with update:", error);
      }
    }

    // Step 3: Upload the new file to Firebase Storage
    const newFileRef = ref(storage, `gallery/${file.name}`);
    await uploadBytes(newFileRef, file);
    const newDownloadURL = await getDownloadURL(newFileRef);
    console.log("New file uploaded successfully. URL:", newDownloadURL);
    

    // Step 4: Update Firestore document with new file details
    await updateDoc(docRef, {
      name: file.name,
      url: newDownloadURL,
    });

    console.log("Firestore document updated successfully!");
    document.querySelector('input[type="file"]').value = ''

    // Step 5: Refresh uploaded data in UI
    toast.update(toastId,{
      render : "FIle Updated Successfully",
      type : "success",
      autoClose : 3000,
      isLoading : false
    })
    setTimeout (() =>{
      setimage(false)

    },3000)
    getGalleryData();
  
  } catch (error) {
    console.error("Error updating file and document:", error);
    toast.update(toastId, {
      render: "Error uploading file",
      type: "error",
      isLoading: false,
      autoClose: 3000,
    });
  }
}

// Example of how UpdateImg might be called
function galleryupdateimg(id) {
  console.log("Preparing to update document with ID:", id);

  const findData = gallery.find((data) => data.id === id);
  console.log(findData);
  
  if (!findData) {
    console.error("Document data not found for ID:", id);
    return;
  }
  setupdate(id); // Set setupdate to the ID of the document you're updating
  setactive("f5"); // Activate file update section in model
  setimage(true);   // Show image update model
  sethide(true);    // Change button to "Update"
  setupdates(false)
  
  setdisbalebtn(false)
  setFile(null)
}

async function gallerydeleteData(id) {
  try {
    // Log the id to check if it's valid
    console.log("Deleting document with ID:", id);
    
    const deleteVal = doc(db, "gallery", id);
    await deleteDoc(deleteVal);
    console.log('image Deleted');
    
    getGalleryData(); // Optionally refresh the data after deletion
  } catch (error) {
    console.error("Error in DeleteImg function:", error);
  }
}

// Example of how DeleteImg might be called
// Ensure that the id passed is a valid string

async function gallerydeleteimg(id) {
  let toastId;
  if (id) {
    console.log(id);
    gallerydeleteData(id); // Call with valid document id
    let toastId = toast.loading("Deleting image...", { // Create the toast first with loading state
      autoClose: false, // Don't auto close yet because we're still in progress
      isLoading: true,  // Show the loading state while deleting
    });
    setTimeout(() => {
      toast.update(toastId, {
        render: "File has been deleted",
        type: "success", 
        autoClose: 3000,  
        isLoading: false, 
      });
    }, 1500);
  } else {
    console.error("Invalid ID passed to DeleteImg");
    toast.update(toastId, {
      render: "Error deleting file", // Error message
      type: "error", // Error type
      autoClose: 3000, // Close after 3 seconds
      isLoading: false, // Hide loading spinner
    });
  }
} 

//Ql
async function SubmitQualityUpload() {
  let toastId;
  console.log(file);
  
  if (!file) {
    console.error('No file selected for upload');
    toastId = toast("No file selected for upload")
    return;
  }
  try {
    const storageRef = ref(storage, `quality/${file.name}`);
      toastId = toast("Uploading....")
      setIsLoading(true)

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      console.log(downloadURL);
      
      const createData = await addDoc(collection(db, 'quality'), {
        name: file.name,
        url: downloadURL,
      });

      console.log('File uploaded successfully:', createData.id);
      document.querySelector('input[type="file"]').value = ''
      getQualityData(); // Refresh uploaded data
      setdisbalebtn(!disbalebtn)


      toast.update(toastId, {
        render: "File uploaded successfully",
        type: "success",
        autoClose: 3000,
        isLoading: false,
      });
  setTimeout(() => {
    setimage(false)
    
  }, 3000);
  } catch (error) {
    console.error('Error uploading file:', error);
    toast.update(toastId, {
      render: "Error uploading file",
      type: "error",
      isLoading: false,
      autoClose: 3000,
    });
    setIsLoading(false)
  }
}

  // Fetch data in Firestore ==url get pannura method
  async function getQualityData() {
    try {
      const getData = await getDocs(collection(db, 'quality'));
        console.log(getData);
        
        const data = getData.docs.map((doc) => ({
          id: doc.id,...doc.data(),
        }));
        console.log(data);
        
        setQuality(data);
    } catch (error) {
      console.error('Error fetching data from Firestore:', error);
  
    }
   }
    
   useEffect(() => {
    getQualityData();
    }, []);
  console.log(quality);


  //DeleteImg 
async function QualityDeleteData(id) {
  try {
    // Log the id to check if it's valid
    console.log("Deleting document with ID:", id);
    
    const deleteVal = doc(db, "quality", id);
    await deleteDoc(deleteVal);
    console.log('image Deleted');
    
    getQualityData(); // Optionally refresh the data after deletion
  } catch (error) {
    console.error("Error in DeleteImg function:", error);
  }
}

// Example of how DeleteImg might be called
// Ensure that the id passed is a valid string

async function QualityDeleteImg(id) {
  let toastId;
  if (id) {
    console.log(id);
    let toastId = toast.loading("Deleting image...", { // Create the toast first with loading state
      autoClose: false, // Don't auto close yet because we're still in progress
      isLoading: true,  // Show the loading state while deleting
    });
    QualityDeleteData(id); // Call with valid document id
    setTimeout(() => {
      toast.update(toastId, {
        render: "File has been deleted",
        type: "success", 
        autoClose: 3000,  
        isLoading: false, 
      });
    }, 1500);
  } else {
    console.error("Invalid ID passed to DeleteImg");
    toast.update(toastId, {
      render: "Error deleting file", // Error message
      type: "error", // Error type
      autoClose: 3000, // Close after 3 seconds
      isLoading: false, // Hide loading spinner
    });
  }
}

// Update a document in Firestore
async function UpdateQualityData(docId) {
  let toastId;
  if (!file) {
    console.error("No file selected for update.");
    toastId = toast("No file selected for update");  

    return;
  }
  if (!docId) {
    console.error("No document ID provided for update.");
    return;
  }
  try {
    console.log("Updating file for document ID:", docId);

    // Step 1: Get reference to the existing document
    const docRef = doc(db, "quality", docId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.error("Document does not exist with ID:", docId);
      return;
    }

    const updatingData = docSnap.data();
    console.log("Updating document data:", updatingData);

     // Step 2: Delete old file from Firebase Storage if it exists
     if (updatingData.url) {
      const storageRef = ref(storage, `quality/${updatingData.name}`);
      toastId = toast("Updating....")
      setupdates(true)
      try {
        await deleteObject(storageRef);
        console.log("Old file deleted successfully.");
      } catch (error) {
        console.warn("Error deleting old file. Proceeding with update:", error);
      }
    }

    // Step 3: Upload the new file to Firebase Storage
    const newFileRef = ref(storage, `quality/${file.name}`);
    await uploadBytes(newFileRef, file);
    const newDownloadURL = await getDownloadURL(newFileRef);
    console.log("New file uploaded successfully. URL:", newDownloadURL);
    

    // Step 4: Update Firestore document with new file details
    await updateDoc(docRef, {
      name: file.name,
      url: newDownloadURL,
    });

    console.log("Firestore document updated successfully!");
    document.querySelector('input[type="file"]').value = ''
    

    // Step 5: Refresh uploaded data in UI
    toast.update(toastId, {
      render: "File updated successfully",
      type: "success",
      autoClose: 3000,
      isLoading: false,
    });
setTimeout(() => {
  setimage(false)
  
}, 3000);
    getQualityData();
  
  } catch (error) {
    console.error("Error updating file and document:", error);
    toast.update(toastId, {
      render: "Error uploading file",
      type: "error",
      isLoading: false,
      autoClose: 3000,
    });
  }
}

// Example of how UpdateImg might be called
function QualityUpdateImg(id) {
  console.log("Preparing to update document with ID:", id);

  const findData = quality.find((data) => data.id === id);
  console.log(findData);
  
  if (!findData) {
    console.error("Document data not found for ID:", id);
    return;
  }
  setupdate(id); // Set setupdate to the ID of the document you're updating
  setactive("f2"); // Activate file update section in modal
  setimage(true);   // Show image update modal
  sethide(true);    // Change button to "Update"
  setupdates(false)
  setdisbalebtn(false)
  setFile(null)

}


//sys

async function SubmitSystemUpload() {
  let toastId;
  if (!file) {
    console.error('No file selected for upload');
    toastId = toast("No file selected for upload")
    return;
  }
  try {
    const storageRef = ref(storage, `system/${file.name}`);
      toastId = toast("Uploading...")
      setIsLoading(true)
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      console.log(downloadURL);
      
      const createData = await addDoc(collection(db, 'system'), {
        name: file.name,
        url: downloadURL,
      });

      console.log('File uploaded successfully:', createData.id);
      document.querySelector('input[type="file"]').value = ''
      setdisbalebtn(!disbalebtn)
      toast.update(toastId,{
        render : "File Upload successfully",
        type : "success",
        autoClose : 3000,
        isLoading :false
      })
      setTimeout(() => {
        setimage(false)
      }, 3000);

      getsystemData(); // Refresh uploaded data
  } catch (error) {
    console.error('Error uploading file:', error);
    toast.update(toastId,{
      render : "Error uploading file",
      type : "error",
      autoClose : 3000,
      isLoading : false
    })
    setIsLoading(false)
  }
}

  // Fetch data in Firestore ==url get pannura method
  async function getsystemData() {
    try {
      const getData = await getDocs(collection(db, 'system'));
        console.log(getData);
        
        const data = getData.docs.map((doc) => ({
          id: doc.id,...doc.data(),
        }));
        console.log(data);
        
        setSystem(data);
    } catch (error) {
      console.error('Error fetching data from Firestore:', error);
  
    }
   }

   useEffect(() => {
    getsystemData();
    }, []);
  console.log(system);

  // Update a document in Firestore
async function UpdateSystemData(docId) {
  let toastId;
  if (!file) {
    console.error("No file selected for update.");
    toastId = toast("No file selected for update");  

    return;
  }
  if (!docId) {
    console.error("No document ID provided for update.");
    return;
  }
  try {
    console.log("Updating file for document ID:", docId);

    // Step 1: Get reference to the existing document
    const docRef = doc(db, "system", docId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.error("Document does not exist with ID:", docId);
      return;
    }

    const updatingData = docSnap.data();
    console.log("Updating document data:", updatingData);

     // Step 2: Delete old file from Firebase Storage if it exists
     if (updatingData.url) {
      const storageRef = ref(storage, `system/${updatingData.name}`);
      toastId = toast("Updating....")
      setupdates(true)
      try {
        await deleteObject(storageRef);
        console.log("Old file deleted successfully.");
      } catch (error) {
        console.warn("Error deleting old file. Proceeding with update:", error);
      }
    }

    // Step 3: Upload the new file to Firebase Storage
    const newFileRef = ref(storage, `system/${file.name}`);
    await uploadBytes(newFileRef, file);
    const newDownloadURL = await getDownloadURL(newFileRef);
    console.log("New file uploaded successfully. URL:", newDownloadURL);
    

    // Step 4: Update Firestore document with new file details
    await updateDoc(docRef, {
      name: file.name,
      url: newDownloadURL,
    });

    console.log("Firestore document updated successfully!");
    document.querySelector('input[type="file"]').value = ''
    
    // Step 5: Refresh uploaded data in UI
    toast.update(toastId,{
      render : "File updated successfully",
      type : "success",
      autoClose : 3000,
      isLoading : false

    })
    setTimeout(() => {
      setimage(false)
    }, 3000);
    getsystemData();
  
  } catch (error) {
    console.error("Error updating file and document:", error);
    toast.update(toastId,{
      render : "Error uploading file",
      type : "error",
      autoClose : 3000,
      isLoading : false
    })
  }
}

// Example of how UpdateImg might be called
function SystemUpdateImg(id) {
  console.log("Preparing to update document with ID:", id);

  const findData = system.find((data) => data.id === id);
  console.log(findData);
  
  if (!findData) {
    console.error("Document data not found for ID:", id);
    return;
  }
  setupdate(id); // Set setupdate to the ID of the document you're updating
  setactive("f3"); // Activate file update section in modal
  setimage(true);   // Show image update modal
  sethide(true);    // Change button to "Update"
  setupdates(false)
  setdisbalebtn(false)
  setFile(null)
}

  //DeleteImg 
  async function SystemDeleteData(id) {
    try {
      // Log the id to check if it's valid
      console.log("Deleting document with ID:", id);
      
      const deleteVal = doc(db, "system", id);
      await deleteDoc(deleteVal);
      console.log('image Deleted');
      
      getsystemData(); // Optionally refresh the data after deletion
    } catch (error) {
      console.error("Error in DeleteImg function:", error);
    }
  }

async function SystemDeleteImg(id) {
  let toastId;
  if (id) {
    console.log(id);
    let toastId = toast.loading("Deleting image...", { // Create the toast first with loading state
      autoClose: false, // Don't auto close yet because we're still in progress
      isLoading: true,  // Show the loading state while deleting
    });
    SystemDeleteData(id); // Call with valid document id

    setTimeout(() => {
      toast.update(toastId, {
        render: "File has been deleted",
        type: "success", 
        autoClose: 3000,  
        isLoading: false, 
      });
    }, 1500);
  } else {
    console.error("Invalid ID passed to DeleteImg");
    toast.update(toastId, {
      render: "Error deleting file", // Error message
      type: "error", // Error type
      autoClose: 3000, // Close after 3 seconds
      isLoading: false, // Hide loading spinner
    });
  }
}

//   //popup open close state
//   const [image, setimage] = useState(false);

//   //map function state and firebase la dataurl convert
//   const [arrays, setarrays] = useState([]);
//   const [quality, setquality] = useState([]);
//   const [system, setsystem] = useState([]);
//   const [intern, setintern] = useState([]);
//   const [gallery, setgallery] = useState([]);
//   //image show agura id set panna
//   const [file, setFile] = useState(null);
//   const [file1, setFile1] = useState();

//   //delete process complete anathum automatic ah update agi view agum
//   const [file2, setFile2] = useState(false);

//   //button true ah irunthu na update btn false ah irunthuchu na submit btn
//   const [hide, sethide] = useState(false);

//   //update state
//   const [data, setdata] = useState("");

//   //popup open event
//   const [active, setactive] = useState("");




 


//   function dashboard(e) {
//     setopen(e);
//     console.log(e);
//   }

//   function edit(event) {
//     setimage(true);
//     sethide(false);
//     setactive(event);
//   }

//   function close() {
//     setimage(false);
//   }

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     if (selectedFile) {
//       setFile(selectedFile);
//       console.log("File selected:", selectedFile.name);
//     } else {
//       console.log("No file selected");
//     }
    
 
//   };

//   console.log(File);

//   //post create

//   const handleUpload = async (title) => {
//     if (!title || title.trim() === "") {
//       alert("Title is required");
//       return;
//     }

//     //upload create method
//     const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
//     if (!allowedTypes.includes(file.type)) {
//       console.error("Invalid file type. Only images are allowed.");
//       return;
//     }

//     try {

    
    

//       const storage = getStorage(db);
//       const storageRef = ref(storage, "images/" + file.name);

//       // Upload the file to Firebase storage
//       console.log("Uploading file to Firebase storage...");
//       await uploadBytes(storageRef, file);
//       console.log("File Upload Successfully");
      

//       // Get the download URL for the uploaded file
//       const dataUrl = await getDownloadURL(storageRef);
//       console.log("Download URL:", dataUrl);

//       // Create a FormData object to send the file with the 'file' field in the form-data
//       const formData = new FormData();
//       formData.append("file", file); // Append the actual file

//       // Send the form data to your backend (POST request)
//       const result = await axios.post(
//         "http://127.0.0.1:8000/upload/",
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data", // Important: tell the server we're sending form-data
//           },
//         }
//       );
//       console.log(result);

//       if (result) {
//         setFile2(!file2);
//         setimage(false);
//       }
//       // Log the server response

//       // Update the frontend state with the new URL if it's not already added
//       setarrays((prev) => (prev.includes(dataUrl) ? prev : [...prev, dataUrl]));

//       // Clear the file input field after a successful upload
//       setFile(null);
//     } catch (err) {
//       console.error("Error:", err.response?.data || err.message);
//     }
//   };
  

//   //ViewAll

//   useEffect(() => {
//     const getData = async () => {
//       try {
//         const response = await axios.get("http://127.0.0.1:8000/files/");
//         console.log(response.data);
//         setarrays(response.data);
//       } catch (error) {
//         console.error("Error uploading file:", error);
//       }
//     };
//     getData();
//   }, [file2]);

//   //Delete

//   async function deleteimg(e) {
//     console.log(e);

//     try {
//       const result = await axios.delete(`http://127.0.0.1:8000/files/${e}/`);
//       console.log(result);
//       if (result) {
//         setFile2(!file2);
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   }

//   //update

//   async function updateimg(event, open) {
//     try {
//       setimage(true); // Open the uploader popup
//       setdata(event);
//       setactive(open);
//       const res = await axios.get(`http://127.0.0.1:8000/files/${event}`);
//       const fileUrl = res.data.file;
//       console.log(fileUrl);
//       setFile1(fileUrl); // Store the file URL for display, but not for setting `value`
//       sethide(true);
//     } catch (err) {
//       console.log(err);
//     }
//   }

//   console.log(file);

//   const updatedata = async () => {
//     console.log(file);

//     if (!file) {
//       console.error("No file selected to upload");
//       return;
//     }

//     const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
//     if (!allowedTypes.includes(file.type)) {
//       console.error("Invalid file type. Only images are allowed.");
//       return;
//     }

//     try {
//       const storage = getStorage(db);
//       const storageRef = ref(storage, "images/" + file.name);

//       console.log("Uploading file to Firebase storage...");
//       await uploadBytes(storageRef, file);
//       console.log("File Upload Successfully");

//       const dataUrl = await getDownloadURL(storageRef);
//       console.log("Download URL:", dataUrl);

//       const formData = new FormData();
//       formData.append("file", file); // Check this
//       console.log("FormData Sent:", formData);
//       console.log(data);

//       const result = await axios.put(
//         `http://127.0.0.1:8000/files/${data}/`,
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       console.log("Result:", result);
//       if (result) {
//         setFile2(!file2);
//         setimage(false);
//       } // Debug response from server

//       setarrays((prev) => (prev.includes(dataUrl) ? prev : [...prev, dataUrl]));
//       setFile(null);
//     } catch (err) {
//       console.error("Update Error:", err.response?.data || err.message);
//     }
//   };

//   //intern create

//   const internUpload = async () => {
//     if (!file) {
//       console.error("No file selected to upload");
//       return;
//     }

//     const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
//     if (!allowedTypes.includes(file.type)) {
//       console.error("Invalid file type. Only images are allowed.");
//       return;
//     }

//     try {
//       const storage = getStorage(db);
//       const storageRef = ref(storage, "images/" + file.name);

//       // Upload the file to Firebase storage
//       console.log("Uploading file to Firebase storage...");
//       await uploadBytes(storageRef, file);
//       console.log("File Upload Successfully");

//       // Get the download URL for the uploaded file
//       const dataUrl = await getDownloadURL(storageRef);
//       console.log("Download URL:", dataUrl);

//       // Create a FormData object to send the file with the 'file' field in the form-data
//       const formData = new FormData();
//       formData.append("file", file); // Append the actual file

//       // Send the form data to your backend (POST request)
//       const result = await axios.post(
//         "http://127.0.0.1:8000/create/",
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data", // Important: tell the server we're sending form-data
//           },
//         }
//       );
//       console.log(result);

//       if (result) {
//         setFile2(!file2);
//         setimage(false);
//       }
//       // Log the server response

//       // Update the frontend state with the new URL if it's not already added
//       setintern((prev) => (prev.includes(dataUrl) ? prev : [...prev, dataUrl]));

//       // Clear the file input field after a successful upload
//       setFile(null);
//     } catch (err) {
//       console.error("Error:", err.response?.data || err.message);
//     }
//   };

//   //intern ViewAll

//   useEffect(() => {
//     const getData = async () => {
//       try {
//         const response = await axios.get("http://127.0.0.1:8000/internfiles/");
//         console.log(response.data);
//         setintern(response.data);
//       } catch (error) {
//         console.error("Error uploading file:", error);
//       }
//     };
//     getData();
//   }, [file2]);

//   //intern Delete

//   async function interndeleteimg(e) {
//     console.log(e);

//     try {
//       const result = await axios.delete(
//         `http://127.0.0.1:8000/internfiles/${e}/`
//       );
//       console.log(result);
//       if (result) {
//         setFile2(!file2);
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   }

//   //intern update

//   async function internupdateimg(event, open) {
//     try {
//       setimage(true); // Open the uploader popup
//       setdata(event);
//       setactive(open);
//       const res = await axios.get(`http://127.0.0.1:8000/internfiles/${event}`);
//       const fileUrl = res.data.file;
//       console.log(fileUrl);
//       setFile1(fileUrl); // Store the file URL for display, but not for setting `value`
//       sethide(true);
//     } catch (err) {
//       console.log(err);
//     }
//   }

//   console.log(file);

//   const internupdate = async () => {
//     console.log(file);

//     if (!file) {
//       console.error("No file selected to upload");
//       return;
//     }

//     const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
//     if (!allowedTypes.includes(file.type)) {
//       console.error("Invalid file type. Only images are allowed.");
//       return;
//     }

//     try {
//       const storage = getStorage(db);
//       const storageRef = ref(storage, "images/" + file.name);

//       await uploadBytes(storageRef, file);

//       const dataUrl = await getDownloadURL(storageRef);
//       console.log("Download URL:", dataUrl);

//       const formData = new FormData();
//       formData.append("file", file); // Check this
//       console.log("FormData Sent:", formData);
//       console.log(data);

//       const result = await axios.put(
//         `http://127.0.0.1:8000/internfiles/${data}/`,
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       console.log("Result:", result);
//       if (result) {
//         setFile2(!file2);
//         setimage(false);
//       } // Debug response from server

//       setintern((prev) => (prev.includes(dataUrl) ? prev : [...prev, dataUrl]));
//       setFile(null);
//     } catch (err) {
//       console.error("Update Error:", err.response?.data || err.message);
//     }
//   };

//   //gallery post

//   const galleryUpload = async () => {
//     if (!file) {
//       console.error("No file selected to upload");
//       return;
//     }

//     const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
//     if (!allowedTypes.includes(file.type)) {
//       console.error("Invalid file type. Only images are allowed.");
//       return;
//     }

//     try {
//       const storage = getStorage(db);
//       const storageRef = ref(storage, "images/" + file.name);

//       // Upload the file to Firebase storage
//       console.log("Uploading file to Firebase storage...");
//       await uploadBytes(storageRef, file);
//       console.log("File Upload Successfully");

//       // Get the download URL for the uploaded file
//       const dataUrl = await getDownloadURL(storageRef);
//       console.log("Download URL:", dataUrl);

//       // Create a FormData object to send the file with the 'file' field in the form-data
//       const formData = new FormData();
//       formData.append("file", file); // Append the actual file

//       // Send the form data to your backend (POST request)
//       const result = await axios.post("http://127.0.0.1:8000/post/", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data", // Important: tell the server we're sending form-data
//         },
//       });
//       console.log(result);

//       if (result) {
//         setFile2(!file2);
//         setimage(false);
//       }
//       // Log the server response

//       // Update the frontend state with the new URL if it's not already added
//       setgallery((prev) =>
//         prev.includes(dataUrl) ? prev : [...prev, dataUrl]
//       );

//       // Clear the file input field after a successful upload
//       setFile(null);
//     } catch (err) {
//       console.error("Error:", err.response?.data || err.message);
//     }
//   };

//   //gallery ViewAll

//   useEffect(() => {
//     const getData = async () => {
//       try {
//         const response = await axios.get("http://127.0.0.1:8000/galleryfiles/");
//         console.log(response.data);
//         setgallery(response.data);
//       } catch (error) {
//         console.error("Error uploading file:", error);
//       }
//     };
//     getData();
//   }, [file2]);

//   // gallery Delete

//   async function gallerydeleteimg(e) {
//     console.log(e);

//     try {
//       const result = await axios.delete(
//         `http://127.0.0.1:8000/galleryfiles/${e}/`
//       );
//       console.log(result);
//       if (result) {
//         setFile2(!file2);
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   }

//   // gallery update

//   async function galleryupdateimg(event, open) {
//     try {
//       setimage(true); // Open the uploader popup
//       setdata(event);
//       setactive(open);
//       const res = await axios.get(
//         `http://127.0.0.1:8000/galleryfiles/${event}`
//       );
//       const fileUrl = res.data.file;
//       console.log(fileUrl);
//       setFile1(fileUrl); // Store the file URL for display, but not for setting `value`
//       sethide(true);
//     } catch (err) {
//       console.log(err);
//     }
//   }

//   console.log(file);

//   const galleryupdate = async () => {
//     console.log(file);

//     if (!file) {
//       console.error("No file selected to upload");
//       return;
//     }

//     const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
//     if (!allowedTypes.includes(file.type)) {
//       console.error("Invalid file type. Only images are allowed.");
//       return;
//     }

//     try {
//       const storage = getStorage(db);
//       const storageRef = ref(storage, "images/" + file.name);

//       console.log("Uploading file to Firebase storage...");
//       await uploadBytes(storageRef, file);
//       console.log("File Upload Successfully");

//       const dataUrl = await getDownloadURL(storageRef);
//       console.log("Download URL:", dataUrl);

//       const formData = new FormData();
//       formData.append("file", file); // Check this
//       console.log("FormData Sent:", formData);
//       console.log(data);

//       const result = await axios.put(
//         `http://127.0.0.1:8000/galleryfiles/${data}/`,
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       console.log("Result:", result);
//       if (result) {
//         setFile2(!file2);
//         setimage(false);
//       } // Debug response from server

//       setgallery((prev) =>
//         prev.includes(dataUrl) ? prev : [...prev, dataUrl]
//       );
//       setFile(null);
//     } catch (err) {
//       console.error("Update Error:", err.response?.data || err.message);
//     }
//   };

//   //ql create

//   const qualltyUpload = async () => {
//     if (!file) {
//       console.error("No file selected to upload");
//       return;
//     }

//     const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
//     if (!allowedTypes.includes(file.type)) {
//       console.error("Invalid file type. Only images are allowed.");
//       return;
//     }

//     try {
//       const storage = getStorage(db);
//       const storageRef = ref(storage, "images/" + file.name);

//       // Upload the file to Firebase storage
//       console.log("Uploading file to Firebase storage...");
//       await uploadBytes(storageRef, file);
//       console.log("File Upload Successfully");

//       // Get the download URL for the uploaded file
//       const dataUrl = await getDownloadURL(storageRef);
//       console.log("Download URL:", dataUrl);

//       // Create a FormData object to send the file with the 'file' field in the form-data
//       const formData = new FormData();
//       formData.append("file", file); // Append the actual file

//       // Send the form data to your backend (POST request)
//       const result = await axios.post(
//         "http://127.0.0.1:8000/creates/",
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data", // Important: tell the server we're sending form-data
//           },
//         }
//       );
//       console.log(result);

//       if (result) {
//         setFile2(!file2);
//         setimage(false);
//       }
//       // Log the server response

//       // Update the frontend state with the new URL if it's not already added
//       setquality((prev) =>
//         prev.includes(dataUrl) ? prev : [...prev, dataUrl]
//       );

//       // Clear the file input field after a successful upload
//       setFile(null);
//     } catch (err) {
//       console.error("Error:", err.response?.data || err.message);
//     }
//   };

//   const qualitydata = async () => {
//     console.log(file);

//     if (!file) {
//       console.error("No file selected to upload");
//       return;
//     }

//     const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
//     if (!allowedTypes.includes(file.type)) {
//       console.error("Invalid file type. Only images are allowed.");
//       return;
//     }

//     try {
//       const storage = getStorage(db);
//       const storageRef = ref(storage, "images/" + file.name);

//       console.log("Uploading file to Firebase storage...");
//       await uploadBytes(storageRef, file);
//       console.log("File Upload Successfully");

//       const dataUrl = await getDownloadURL(storageRef);
//       console.log("Download URL:", dataUrl);

//       const formData = new FormData();
//       formData.append("file", file); // Check this
//       console.log("FormData Sent:", formData);
//       console.log(data);

//       const result = await axios.put(
//         `http://127.0.0.1:8000/qualityfiles/${data}/`,
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       console.log("Result:", result);
//       if (result) {
//         setFile2(!file2);
//         setimage(false);
//       } // Debug response from server

//       setquality((prev) =>
//         prev.includes(dataUrl) ? prev : [...prev, dataUrl]
//       );
//       setFile(null);
//     } catch (err) {
//       console.error("Update Error:", err.response?.data || err.message);
//     }
//   };

//   useEffect(() => {
//     const getData = async () => {
//       try {
//         const response = await axios.get("http://127.0.0.1:8000/qualityfiles/");
//         console.log(response.data);
//         setquality(response.data);
//       } catch (error) {
//         console.error("Error uploading file:", error);
//       }
//     };
//     getData();
//   }, [file2]);

//   async function qualityupdateimg(event, open) {
//     try {
//       setimage(true); // Open the uploader popup
//       setdata(event);
//       setactive(open);
//       const res = await axios.get(`http://127.0.0.1:8000/qualityfiles/${event}`);
//       const fileUrl = res.data.file;
//       console.log(fileUrl);
//       setFile1(fileUrl); // Store the file URL for display, but not for setting `value`
//       sethide(true);
//     } catch (err) {
//       console.log(err);
//     }
//   }

//   async function qualitydeleteimg(e) {
//     console.log(e);

//     try {
//       const result = await axios.delete(
//         `http://127.0.0.1:8000/qualityfiles/${e}/`
//       );
//       console.log(result);
//       if (result) {
//         setFile2(!file2);
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   }
// //syaterm
//   const systemUpload = async () => {
//     if (!file) {
//       console.error("No file selected to upload");
//       return;
//     }

//     const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
//     if (!allowedTypes.includes(file.type)) {
//       console.error("Invalid file type. Only images are allowed.");
//       return;
//     }

//     try {
//       const storage = getStorage(db);
//       const storageRef = ref(storage, "images/" + file.name);

//       // Upload the file to Firebase storage
//       console.log("Uploading file to Firebase storage...");
//       await uploadBytes(storageRef, file);
//       console.log("File Upload Successfully");

//       // Get the download URL for the uploaded file
//       const dataUrl = await getDownloadURL(storageRef);
//       console.log("Download URL:", dataUrl);

//       // Create a FormData object to send the file with the 'file' field in the form-data
//       const formData = new FormData();
//       formData.append("file", file); // Append the actual file

//       // Send the form data to your backend (POST request)
//       const result = await axios.post(
//         "http://127.0.0.1:8000/dsrcreate/",
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data", // Important: tell the server we're sending form-data
//           },
//         }
//       );
//       console.log(result);

//       if (result) {
//         setFile2(!file2);
//         setimage(false);
//       }
//       // Log the server response

//       // Update the frontend state with the new URL if it's not already added
//       setsystem((prev) =>
//         prev.includes(dataUrl) ? prev : [...prev, dataUrl]
//       );

//       // Clear the file input field after a successful upload
//       setFile(null);
//     } catch (err) {
//       console.error("Error:", err.response?.data || err.message);
//     }
//   };

//   const systemdata = async () => {
//     console.log(file);

//     if (!file) {
//       console.error("No file selected to upload");
//       return;
//     }

//     const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
//     if (!allowedTypes.includes(file.type)) {
//       console.error("Invalid file type. Only images are allowed.");
//       return;
//     }

//     try {
//       const storage = getStorage(db);
//       const storageRef = ref(storage, "images/" + file.name);

//       await uploadBytes(storageRef, file);

//       const dataUrl = await getDownloadURL(storageRef);
//       console.log("Download URL:", dataUrl);

//       const formData = new FormData();
//       formData.append("file", file); // Check this
//       console.log("FormData Sent:", formData);
//       console.log(data);

//       const result = await axios.put(
//         `http://127.0.0.1:8000/dsrfiles/${data}/`,
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       console.log("Result:", result);
//       if (result) {
//         setFile2(!file2);
//         setimage(false);
//       } // Debug response from server

//       setsystem((prev) =>
//         prev.includes(dataUrl) ? prev : [...prev, dataUrl]
//       );
//       setFile(null);
//     } catch (err) {
//       console.error("Update Error:", err.response?.data || err.message);
//     }
//   };

//   useEffect(() => {
//     const getData = async () => {
//       try {
//         const response = await axios.get("http://127.0.0.1:8000/dsrfiles/");
//         console.log(response.data);
//         setsystem(response.data);
//       } catch (error) {
//         console.error("Error uploading file:", error);
//       }
//     };
//     getData();
//   }, [file2]);

//   async function systemupdateimg(event, open) {
//     try {
//       setimage(true); // Open the uploader popup
//       setdata(event);
//       setactive(open);
//       const res = await axios.get(`http://127.0.0.1:8000/dsrfiles/${event}`);
//       const fileUrl = res.data.file;
//       console.log(fileUrl);
//       setFile1(fileUrl); // Store the file URL for display, but not for setting `value`
//       sethide(true);
//     } catch (err) {
//       console.log(err);
//     }
//   }

//   async function systemdeleteimg(e) {
//     console.log(e);

//     try {
//       const result = await axios.delete(
//         `http://127.0.0.1:8000/dsrfiles/${e}/`
//       );
//       console.log(result);
//       if (result) {
//         setFile2(!file2);
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   }

  return (
    <>
      <div className="sidenavbar">
        <div className="sidenav_left">
          <div className="sidenav_logo">
            <img src={logo} alt="" />
          </div>
          <div className="sidenav_list">
            <div className={open=="profile" ?"list2":"list1"} onClick={() => dashboard("profile")}>
              <p>
                <CgProfile className="list_i" />
              </p>
              <h4>Profile</h4>
            </div>

            <div className={open=="quality" ?"list2":"list1"} onClick={() => dashboard("quality")}>
              <p>
                <MdHighQuality className="list_i" />
              </p>
              <h4>Quality</h4>
            </div>

            <div className={open == "system" ?"list2" : "list1" } onClick={() => dashboard("system")}>
              <p>
                <MdSystemSecurityUpdate className="list_i" />
              </p>
              <h4>DSR Systems</h4>
            </div>

            <div className={open == "inte" ? "list2":"list1"} onClick={() => dashboard("inte")}>
              <p>
                <FaInternetExplorer className="list_i" />
              </p>
              <h4>Internship</h4>
            </div>

            <div className={open == "gallery" ? "list2" : "list1"} onClick={() => dashboard("gallery")}>
              <p>
                <FiCamera className="list_i" />
              </p>
              <h4>Gallery</h4>
            </div>
          </div>
        </div>

        <div className="sidenav_right">
        <ToastContainer/>

          <div className="right_head">
            {open == "profile" && (
              <div className="right_profile">
                <div className="pro">
                  <h2>PROFILE</h2>
                   <p>
                    <IoMdAdd className="add_i" onClick={() => edit("f1")} />
                  </p> 
                </div>
                <div className="pro_grid">
                {uploadedData.map(function (data) {
                  return (
                    <div className="ch" key={data.id}>
                      <img src={data.url} alt="" />
                      <div className="profile_btn">
                        <button onClick={() => handleUpdate(data.id)}>
                          Update
                        </button>
                        <button onClick={() => DeleteImg(data.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
                </div>
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
                <div className="qua_grid">
                {quality.map(function (data) {
                  return(
                  <div className="qua" key={data.id}>
                  <img src={data.url} alt="" />

                  <div className="profile_btn">
                    <button onClick={() => QualityUpdateImg(data.id)}>
                      Update
                    </button>
                    <button onClick={() => QualityDeleteImg(data.id)}>
                      Delete
                    </button>
                  </div>
                </div>
                  )
                })}
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
              <div className="sys_grid">
              {system.map(function (data) {
                return(
                <div className="sys" key={data.id}>
                <img src={data.url} alt="" />

                <div className="profile_btn">
                  <button onClick={() => SystemUpdateImg(data.id,"f3")}>Update</button>
                  <button onClick={() => SystemDeleteImg(data.id)}>Delete</button>
                </div>
              </div>
                )
              })}
              </div>
            </div>
          )} 

          {open == "inte" && (
            <div className="internship">
              <div className="pro">
                <h2>INTERNSHIP</h2>
                <p>
                  <IoMdAdd className="add_i" onClick={() => edit("f4")} />
                </p>
              </div>

              <div className="gridcheck">
                {intern.map(function name(data) {
                  return (
                    <div className="internship2" key={data.id}>
                      <div className="internship1">
                        <img src={data.url} alt="" />
                          
                        
                        <div className="intern_btn">
                          <button
                            onClick={() => internupdateimg(data.id)}
                          >
                            Update
                          </button>
                          <button onClick={() => interndeleteimg(data.id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )} 

          {open == "gallery" && (
            <div className="gallery" >
              <div className="pro">
                <h2>OUR SERVICE</h2>
                <p>
                  <IoMdAdd className="add_i" onClick={() => edit("f5")} />
                </p>
              </div>

              <div className="gallery_grid">
              {gallery.map(function (data) {
                return (
                  <div className="gallery1" key={data.id}>
                    <img src={data.url} alt="" />
                    
                    <div className="profile_btn1">
                      <button onClick={() => galleryupdateimg(data.id)}>
                        Update
                      </button>
                      <button onClick={() => gallerydeleteimg(data.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          )}   
        </div>

        <div className={image ? "popup1" : "popup"}>

          <div className="popup_head1">
            {active == "f1" && (
              <div className="popup_head">
                <h3>Image Uploader</h3>
                <div className="close_btn">
                  <p>
                    <IoCloseOutline className="close_i" onClick={()=>close()}/>
                  </p>
                </div>
                <input type="file"  onChange={inputdata} name={file} />
                <div className="popup_btn">
                  {!hide && !isLoading  && <button onClick={submitFileUpload} disabled={disbalebtn}>Submit</button>}
                  {hide && !updates &&<button onClick={()=>updateFileUpload(update)  } disabled={disbalebtn}>Update</button>}
                </div>
              </div>
             )}

              {active == "f2" && (
              <div className="popup_head">
             <h3>Image Uploader</h3>
                <div className="close_btn" onClick={() => close()}>
                  <p>
                    <IoCloseOutline className="close_i" />
                  </p>
                </div>
                <input type="file" onChange={inputdata} />
                <div className="popup_btn">
                {!hide && !isLoading  && <button onClick={SubmitQualityUpload} disabled={disbalebtn}>Submit</button>}
                {hide && !updates &&<button onClick={ ()=>UpdateQualityData(update)} disabled={disbalebtn}>Update</button>}
</div>
              </div>
            )} 

            {active == "f3" && (
              <div className="popup_head">
                <h3>Image Uploader</h3>
                <div className="close_btn" onClick={() => close()}>
                  <p>
                    <IoCloseOutline className="close_i" />
                  </p>
                </div>
                <input type="file" onChange={inputdata} />
                <div className="popup_btn">
                {!hide && !isLoading  && <button onClick={SubmitSystemUpload} disabled={disbalebtn}>Submit</button>}
                {hide && !updates &&<button onClick={ ()=>UpdateSystemData(update)} disabled={disbalebtn}>Update</button>}

                </div>
              </div>
            )} 

             {active == "f4" && (
              <div className="popup_head">
                <h3>Image Uploader</h3>
                <div className="close_btn" onClick={() => close()}>
                  <p>
                    <IoCloseOutline className="close_i" />
                  </p>
                </div>
                <input type="file" onChange={inputdata} />
                <div className="popup_btn">
                {!hide && !isLoading  && <button onClick={internfileUpload} disabled={disbalebtn}>Submit</button>}
                {hide && !updates &&<button onClick={ ()=>internFileupdate(update)} disabled={disbalebtn}>Update</button>}

                </div>
              </div>
            )} 

             {active == "f5" && (
              <div className="popup_head">
                <h3>Image Uploader</h3>
                <div className="close_btn" onClick={() => close()}>
                  <p>
                    <IoCloseOutline className="close_i" />
                  </p>
                </div>
                <input type="file" onChange={inputdata} />
                <div className="popup_btn">
                {!hide && !isLoading  && <button onClick={galleryFileUpload} disabled={disbalebtn}>Submit</button>}
                {hide && !updates &&<button onClick={ ()=>galleryFileupdate(update)} disabled={disbalebtn}>Update</button>}

                </div>
              </div>
            )}   
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidenavbar;



