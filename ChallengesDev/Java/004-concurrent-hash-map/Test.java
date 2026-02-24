import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class Test {
    public static void main(String[] args) throws InterruptedException {
        SimpleConcurrentHashMap<String, Integer> map = new SimpleConcurrentHashMap<>(10);
        ExecutorService executor = Executors.newFixedThreadPool(4);

        // Concurrent insertion
        for (int i = 0; i < 100; i++) {
            final int val = i;
            executor.execute(() -> map.put("key" + (val % 10), val));
        }

        executor.shutdown();
        executor.awaitTermination(5, TimeUnit.SECONDS);

        // Verify no fatal errors and a value can be retrieved
        System.out.println("Value for key0: " + map.get("key0"));
        System.out.println("Challenge 004 (Java): Basic concurrency test completed.");
    }
}
