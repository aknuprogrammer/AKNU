const Certificate = require('../../models/certificationFee/CertificateModel');

function generateReference() {
  return 'CERT' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

class CertificateController {
  async submitApplication(req, res) {
    try {
      const reference_no = generateReference();
      const certificateData = {
        ...req.body,
        reference_no
      };

      const newCertificate = await Certificate.create(certificateData);
      
      res.status(201).json({
        success: true,
        reference_no: newCertificate.reference_no,
        application_id: newCertificate._id
      });

    } catch (error) {
      console.error('Error submitting application:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to submit application',
        error: error.message
      });
    }
  }

  async getApplicationStatus(req, res) {
    try {
      const application = await Certificate.findOne({ 
        reference_no: req.params.reference_no 
      });
      
      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      res.status(200).json({
        success: true,
        data: application
      });

    } catch (error) {
      console.error('Error fetching application:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch application',
        error: error.message
      });
    }
  }

  async getAllApplications(req, res) {
    try {
      const { page = 1, limit = 10, sort = '-insert_date', ...filters } = req.query;
      
      // Build filter object
      const filterObj = {};
      for (const [key, value] of Object.entries(filters)) {
        if (value) {
          // For numeric fields
          if (['amount'].includes(key)) {
            filterObj[key] = Number(value);
          } 
          // For text search
          else if (['name', 'regd', 'reference_no'].includes(key)) {
            filterObj[key] = { $regex: value, $options: 'i' };
          }
          // For exact match
          else {
            filterObj[key] = value;
          }
        }
      }

      const applications = await Certificate.find(filterObj)
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const count = await Certificate.countDocuments(filterObj);

      res.status(200).json({
        success: true,
        total: count,
        page: Number(page),
        pages: Math.ceil(count / limit),
        data: applications
      });

    } catch (error) {
      console.error('Error fetching applications:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch applications',
        error: error.message
      });
    }
  }
}

module.exports = new CertificateController();