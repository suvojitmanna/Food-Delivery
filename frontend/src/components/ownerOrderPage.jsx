
const OwnerOrderPage = ({ orders = [] }) => {
  console.log("Orders:", orders);
console.log(orders[0]?.deliveryAddress?.mobileNumber);

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div className=""></div>
    </div>
  );
};

export default OwnerOrderPage;