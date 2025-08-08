const Debtor = require("../models/Debtor");

const cloudinary = require("../utils/cloudinary");

// ✅ Get All Debtors
exports.addDebtor = async (req, res) => {
  try {
    const {
      id,
      name,
      address,
      mobile,
      debtAmount,
      debtDate,
      interestRate,
      currentDate,
      comment, // ✅ Add this line
    } = req.body;

    const interestAmount = ((parseFloat(interestRate) / 100) * parseFloat(debtAmount)).toFixed(2);

    const existingDebtor = await Debtor.findOne({ id });
    if (existingDebtor) {
      return res.status(400).json({ message: "Debtor ID already exists." });
    }

    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile)) {
      return res.status(400).json({ message: "Invalid mobile number" });
    }

    const photoData = req.files?.photo?.[0]
      ? await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: "debtors" },
            (error, result) => {
              if (error) reject(error);
              else resolve({
                url: result.secure_url,
                name: result.original_filename,
              });
            }
          ).end(req.files.photo[0].buffer);
        })
      : null;

    const bondPaperUrls = req.files?.bondPapers
      ? await Promise.all(
          req.files.bondPapers.map((file) =>
            new Promise((resolve, reject) => {
              cloudinary.uploader.upload_stream(
                { folder: "bondPapers" },
                (error, result) => {
                  if (error) reject(error);
                  else resolve({
                    url: result.secure_url,
                    name: result.original_filename,
                  });
                }
              ).end(file.buffer);
            })
          )
        )
      : [];

    const checkLeavesUrls = req.files?.checkLeaves
      ? await Promise.all(
          req.files.checkLeaves.map((file) =>
            new Promise((resolve, reject) => {
              cloudinary.uploader.upload_stream(
                { folder: "checkLeaves" },
                (error, result) => {
                  if (error) reject(error);
                  else resolve({
                    url: result.secure_url,
                    name: result.original_filename,
                  });
                }
              ).end(file.buffer);
            })
          )
        )
      : [];

    const newDebtor = new Debtor({
      id,
      name,
      address,
      mobile,
      photo: photoData,
      debtAmount,
      debtDate,
      interestRate,
      interestAmount,
      currentDate,
      comment, // ✅ Add comment here too
      bondPapers: bondPaperUrls,
      checkLeaves: checkLeavesUrls,
      interestPaidMonths: [],
    });

    await newDebtor.save();
    res.status(201).json({ message: "Debtor added successfully", debtor: newDebtor });
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    res.status(500).json({ error: error.message });
  }
};




// ✅ Add Debtor
exports.addDebtor = async (req, res) => {
  try {
    const { id, name, address, mobile, debtAmount, debtDate, interestRate, currentDate } = req.body;

    const interestAmount = ((parseFloat(interestRate) / 100) * parseFloat(debtAmount)).toFixed(2);

    const existingDebtor = await Debtor.findOne({ id });
    if (existingDebtor) {
      return res.status(400).json({ message: "Debtor ID already exists." });
    }

    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile)) {
      return res.status(400).json({ message: "Invalid mobile number" });
    }

const photoData = req.files?.photo?.[0]
  ? await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "debtors" },
        (error, result) => {
          if (error) reject(error);
          else resolve({
            url: result.secure_url,
            name: result.original_filename,
          });
        }
      ).end(req.files.photo[0].buffer);
    })
  : null;


const bondPaperUrls = req.files?.bondPapers
  ? await Promise.all(req.files.bondPapers.map(file =>
      new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "bondPapers" },
          (error, result) => {
            if (error) reject(error);
            else resolve({ url: result.secure_url, name: result.original_filename });
          }
        ).end(file.buffer);
      })
    ))
  : [];

const checkLeavesUrls = req.files?.checkLeaves
  ? await Promise.all(req.files.checkLeaves.map(file =>
      new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "checkLeaves" },
          (error, result) => {
            if (error) reject(error);
            else resolve({ url: result.secure_url, name: result.original_filename });
          }
        ).end(file.buffer);
      })
    ))
  : [];

const newDebtor = new Debtor({
  id,
  name,
  address,
  mobile,
 photo: photoData,
  debtAmount,
  debtDate,
  interestRate,
  interestAmount,
  currentDate,
  bondPapers: bondPaperUrls, // ✅ Already in { url, name }
  checkLeaves: checkLeavesUrls,
  interestPaidMonths: [],
});


    await newDebtor.save();
    res.status(201).json({ message: "Debtor added successfully", debtor: newDebtor });

  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    res.status(500).json({ error: error.message });
  }
};



//edit 
exports.updateDebtor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, mobile, debtAmount, debtDate, interestRate, currentDate } = req.body;

    const debtor = await Debtor.findById(id);
    if (!debtor) return res.status(404).json({ message: "Debtor not found" });

    // ✅ Basic field updates
    if (name) debtor.name = name;
    if (address) debtor.address = address;

    if (mobile) {
      const mobileRegex = /^[6-9]\d{9}$/;
      if (!mobileRegex.test(mobile)) {
        return res.status(400).json({ message: "Invalid mobile number" });
      }
      debtor.mobile = mobile;
    }

    // ✅ Update financial details
    if (debtAmount) debtor.debtAmount = debtAmount;
    if (debtDate) debtor.debtDate = debtDate;
    if (interestRate) debtor.interestRate = interestRate;
    if (currentDate) debtor.currentDate = currentDate;

    // ✅ Update interestAmount if needed
    if (debtAmount && interestRate) {
      debtor.interestAmount = ((parseFloat(interestRate) / 100) * parseFloat(debtAmount)).toFixed(2);
    }

    // ✅ Recalculate remaining balance if debtAmount is changed
    if (debtAmount) {
      const principalPaid = debtor.principalPaid || 0;
      debtor.remainingBalance = parseFloat(debtAmount) - parseFloat(principalPaid);
    }

    // ✅ Upload Helpers
    const uploadToCloudinary = (file, folder) => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder },
          (error, result) => {
            if (error) reject(error);
            else resolve({
              url: result.secure_url,
              name: result.original_filename,
            });
          }
        ).end(file.buffer);
      });
    };

    // ✅ Update photo
    if (req.files?.photo) {
      const uploadedPhoto = await uploadToCloudinary(req.files.photo[0], "debtors");
      debtor.photo = uploadedPhoto;
    }

    // ✅ Update bond papers
    if (req.files?.bondPapers) {
      const bondPapersUploads = await Promise.all(
        req.files.bondPapers.map(file => uploadToCloudinary(file, "bondPapers"))
      );
      debtor.bondPapers = bondPapersUploads;
    }

    // ✅ Update check leaves
    if (req.files?.checkLeaves) {
      const checkLeavesUploads = await Promise.all(
        req.files.checkLeaves.map(file => uploadToCloudinary(file, "checkLeaves"))
      );
      debtor.checkLeaves = checkLeavesUploads;
    }

    await debtor.save();
    res.status(200).json({ message: "Debtor updated successfully", debtor });

  } catch (error) {
    console.error("Error updating debtor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};





// ✅ Pay Interest
// Controller in userController.js
exports.payInterest = async (req, res) => {
   console.log("➡️ /pay-interest endpoint hit", req.body); 
  const { debtorId, paidMonths, paidDate, amount } = req.body;

  const debtor = await Debtor.findOne({ id: debtorId });
  if (!debtor) return res.status(404).json({ message: "Debtor not found" });

  paidMonths.forEach(month => {
    debtor.interestPaidMonths.push({ month, date: paidDate, amount });
  });

  await debtor.save();
  res.status(200).json({ message: "Interest recorded successfully" });
};



// ✅ Pay Principal
// ✅ Pay Principal
exports.payPrincipal = async (req, res) => {
  try {
    const { id } = req.params; // MongoDB debtor _id
    const { amount, paymentDate, paymentMethod } = req.body;

    // Basic validations
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid payment amount." });
    }
    if (!paymentDate) {
      return res.status(400).json({ error: "Payment date is required." });
    }
    if (!paymentMethod || typeof paymentMethod !== 'string') {
      return res.status(400).json({ error: "Payment method is required and must be a string." });
    }

    // Find the debtor by ID
    const debtor = await Debtor.findById(id);
    if (!debtor) {
      return res.status(404).json({ error: "Debtor not found." });
    }

    const paymentAmount = parseFloat(amount);

    // Initialize remainingBalance if missing
    if (debtor.remainingBalance === undefined || debtor.remainingBalance === null) {
      debtor.remainingBalance = parseFloat(debtor.debtAmount);
    }

    const currentRemainingBalance = parseFloat(debtor.remainingBalance);

    if (paymentAmount > currentRemainingBalance) {
      return res.status(400).json({ error: "Payment amount exceeds remaining balance." });
    }

    // Update payment history
    debtor.paymentHistory.push({
      amount: paymentAmount.toFixed(2),
      date: paymentDate,
      method: paymentMethod,
    });

    // Calculate new remaining balance
    const newRemainingBalance = currentRemainingBalance - paymentAmount;
    debtor.remainingBalance = newRemainingBalance.toFixed(2);

    // Recalculate new interest amount based on updated balance
    const interestRatePercent = parseFloat(debtor.interestRate) / 100;
    debtor.interestAmount = (newRemainingBalance * interestRatePercent).toFixed(2);

    // Save the updated debtor
    await debtor.save();

    // Send success response
    res.status(200).json({ message: "Principal payment successful", debtor });

  } catch (error) {
    console.error("Error in payPrincipal:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};





// ✅ Get a single debtor by ID
const mongoose = require("mongoose");

exports.getDebtorById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid debtor ID format" });
    }

    const debtor = await Debtor.findById(req.params.id);
    if (!debtor) return res.status(404).json({ message: "Debtor not found" });

    res.json(debtor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteDebtor = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid debtor ID format" });
    }

    const debtor = await Debtor.findByIdAndDelete(req.params.id);
    if (!debtor) return res.status(404).json({ message: "Debtor not found" });

    res.json({ message: "Debtor deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



