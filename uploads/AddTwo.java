public class AddTwo {
    public static void main(String[] args) {
        if (args.length > 0) {
            String input = args[0];
            input = input.replaceAll("[^0-9,]", "");
            String[] nums = input.split(",");
            int a = Integer.parseInt(nums[0]);
            int b = Integer.parseInt(nums[1]);
            System.out.println(a + b);
        } else {
            System.out.println("No input provided");
        }
    }
}
