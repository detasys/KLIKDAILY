const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");

app.use(cors());
app.use(express.json());

// get all stocks
app.get("/klikdaily/stocks", async (req, res) => {
    try {
      const allStocks = await pool.query("SELECT tbl_stock.id_lokasi as id_lokasi, tbl_lokasi.nama_lokasi as nama_lokasi, quantity, tbl_produk.nama_produk FROM tbl_stock join tbl_produk on tbl_stock.id_produk = tbl_produk.id_produk join tbl_lokasi on tbl_stock.id_lokasi = tbl_lokasi.id_lokasi");
      let status_message = '';
      if(res.status_code = 200)
      {status_message = 'Success';}
      else{status_message = 'Failed';}

      var stock_json = {
          'status_code' : res.statusCode,
          'status_message' : status_message,
          'stocks' : allStocks.rows
      };
      res.json(stock_json);
    } catch (err) {
      console.error(err.message);
    }
  });

  //adjustment
app.put("/klikdaily/adjustment", async (req, res) => {
    try {
      let status_message = '';
      let validasi = 'Valid';
      let counter_valid = 0;
      // post request
      let adjustment_produk = [
          {
              'id_lokasi' : 1,
              'nama_produk' : 'Indomie Goreng',
              'adjustment' : -10
          },
          {
              'id_lokasi' : 2,
              'nama_produk' : 'Kopi',
              'adjustment' : 6
          }
        ];

        var resp_stock =  new Array(adjustment_produk.length);
        var detail_results = {
            'status' : '',
            'updated_at' : '',
            'location_id' : 0,
            'location_name' : '',
            'product' : '',
            'adjustment' : 0,
            'stock_quantity' : 0,
            'error_message' : ''
        }

        for(let i = 0; i < adjustment_produk.length; i++) {
            var obj = adjustment_produk[i];
            var result_ = detail_results[i];
            let type_adjustment = '';
            if(obj.adjustment > 0)
            {type_adjustment = 'Inbound';}else{type_adjustment='Outbound';}

            const getIdProduk = await pool.query("SELECT id_produk FROM tbl_produk WHERE nama_produk = $1", [
                obj.nama_produk]); 
            const checkProduk = await pool.query("SELECT id_stock FROM tbl_stock WHERE id_lokasi = $1 and id_produk = $2", [
                    obj.id_lokasi,getIdProduk]); 
            const getCurrentStock = await pool.query("SELECT quantity FROM tbl_stock WHERE id_lokasi = $1 and id_produk = $2", [
                obj.id_lokasi,getIdProduk]); 
            const getNamaLokasi = await pool.query("SELECT nama_lokasi FROM tbl_lokasi WHERE id_lokasi = $1", [
                obj.id_lokasi]); 
            const stock_terupdate = getCurrentStock + obj.adjustment;
           if(checkProduk.rows.length>1)
           { 
                const updateStock = await pool.query(
                "UPDATE tbl_stock SET quantity = $1 WHERE id_stock = $2",
                [stock_terupdate,checkProduk]
              );
                result_.status = 'Success';
                result_.stock_quantity = stock_terupdate;
                result_.location_id = obj.location_id;
                result_.location_name = getNamaLokasi;
                result_.product = obj.nama_produk;
                result_.adjustment = obj.adjustment;
                counter_valid++;
           }
           else{
               validasi = 'Invalid';
               result_.status = 'Failed';
               result_.error_message = 'Invalid Product';
               result_.location_id = obj.location_id;
           }
           resp_stock[i] = detail_results; 
        }

        var hasil_akhir = {
            'status_code' : res.statusCode,
            'requests' : adjustment_produk.length,
            'adjusted' : counter_valid,
            'results' : resp_stock
        };

      res.json(hasil_akhir);
    } catch (err) {
      console.error(err.message);
    }
  });

// get a log 
app.get("/klikdaily/logs/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const getLogs = await pool.query("SELECT * FROM tbl_log WHERE id_produk = $1", [
        id
        ]); 
        let status_message = '';
        if(res.status_code = 200)
        {status_message = 'Success, logs found';}
        else{status_message = 'Failed';}

        var getAllLogs = {
            'status_code' : res.statusCode,
            'status_message' : status_message,
            'stocks' : getLogs.rows
        };
        res.json(getAllLogs);
    } catch (err) {
        console.error(err.message);
    }
 });


app.listen(5000, () => {
    console.log("server has started on port 5000");
} );